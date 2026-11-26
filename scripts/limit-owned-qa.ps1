param(
 [Parameter(Mandatory=$true)][ValidateSet('Birth','Inspect','Limit','Stop')][string]$Mode,
 [Parameter(Mandatory=$true)][ValidateRange(1,2147483647)][int]$OwnedPid,
 [string]$ExpectedStartTicks = '',
 [string]$PinnedProcessesJson = ''
)
$ErrorActionPreference = 'Stop'
$phaseClock = [Diagnostics.Stopwatch]::StartNew()
function Write-OwnedPhase([string]$Phase) {
 [Console]::Error.WriteLine('OWNED_QA_PHASE ' + $Phase + ' ' + $phaseClock.Elapsed.TotalMilliseconds.ToString('F3',[Globalization.CultureInfo]::InvariantCulture))
}
Write-OwnedPhase 'ENTER'
function Get-StartTicks($Process) {
 if ($null -eq $Process) { return '' }
 try {
  if ($Process.HasExited) { return '' }
  $start = $Process.StartTime
  if ($null -eq $start) { return '' }
  return $start.ToUniversalTime().Ticks.ToString()
 } catch {
  if ($null -eq (Get-Process -Id $Process.Id -ErrorAction SilentlyContinue)) { return '' }
  throw
 }
}
function Stop-PinnedProcess([int]$ProcessId,[string]$StartTicks) {
 $p = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
 if ((Get-StartTicks $p) -ne $StartTicks) { return }
 try { Stop-Process -Id $ProcessId -Force -ErrorAction Stop } catch {
  $raced = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
  if ((Get-StartTicks $raced) -eq $StartTicks) { throw }
 }
 $until = [DateTime]::UtcNow.AddSeconds(2)
 do {
  $remaining = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
  if ((Get-StartTicks $remaining) -ne $StartTicks) { return }
  Start-Sleep -Milliseconds 25
 } while ([DateTime]::UtcNow -lt $until)
 throw 'Owned process remained alive after Stop-Process'
}
try {
 # Cleanup can use the exact PID/start-time receipts previously returned by
 # this helper even after their owned parent has already exited.
 if ($PinnedProcessesJson -ne '') {
  if ($Mode -ne 'Stop' -or $ExpectedStartTicks -eq '') { throw 'Pinned receipts are accepted only for owner cleanup' }
  $receipts = ConvertFrom-Json -InputObject $PinnedProcessesJson
  $stopped = @()
  foreach ($receipt in @($receipts | Sort-Object depth -Descending)) {
   if ([int]$receipt.pid -le 0 -or "$($receipt.startTicks)" -notmatch '^\d+$') { throw 'Invalid owned process receipt' }
   $p = Get-Process -Id ([int]$receipt.pid) -ErrorAction SilentlyContinue
   if ((Get-StartTicks $p) -eq [string]$receipt.startTicks) {
    Stop-PinnedProcess -ProcessId ([int]$receipt.pid) -StartTicks ([string]$receipt.startTicks)
    $stopped += @{pid=[int]$receipt.pid;startTicks=[string]$receipt.startTicks;stopped=$true}
   }
  }
  @{result='PASS';mode=$Mode;processes=@($stopped)} | ConvertTo-Json -Compress -Depth 6
  exit 0
 }
 $owned = Get-Process -Id $OwnedPid -ErrorAction SilentlyContinue
 if ($null -eq $owned) { @{result='GONE';pid=$OwnedPid;processes=@()} | ConvertTo-Json -Compress -Depth 6; exit 0 }
 $rootTicks = Get-StartTicks $owned
 if ($rootTicks -eq '') { @{result='GONE';pid=$OwnedPid;processes=@()} | ConvertTo-Json -Compress -Depth 6; exit 0 }
 if ($ExpectedStartTicks -ne '' -and $ExpectedStartTicks -ne $rootTicks) { throw 'Owned PID start time changed; refusing process operation' }
 if ($Mode -eq 'Birth') { @{result='PASS';pid=$OwnedPid;startTicks=$rootTicks;processes=@(@{pid=$OwnedPid;startTicks=$rootTicks;depth=0})} | ConvertTo-Json -Compress -Depth 6; exit 0 }
 if ($Mode -ne 'Inspect' -and $ExpectedStartTicks -eq '') { throw 'Mutations require the pinned owner start time' }
 # Enumerate ancestry, never process names. Every selected PID is pinned again
 # immediately before changing its scheduler or terminating it.
 Write-OwnedPhase 'INTEROP'
 if (-not ('OwnedQaProcessTree' -as [type])) {
  Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
public struct OwnedQaProcessLink { public uint ProcessId; public uint ParentProcessId; }
public static class OwnedQaProcessTree {
 [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
 private struct Entry {
  public uint Size,Usage,Id; public IntPtr Heap;
  public uint Module,Threads,Parent; public int Priority; public uint Flags;
  [MarshalAs(UnmanagedType.ByValTStr,SizeConst=260)] public string Name;
 }
 [DllImport("kernel32.dll",SetLastError=true)] private static extern IntPtr CreateToolhelp32Snapshot(uint flags,uint id);
 [DllImport("kernel32.dll",SetLastError=true,CharSet=CharSet.Unicode)] private static extern bool Process32FirstW(IntPtr handle,ref Entry entry);
 [DllImport("kernel32.dll",SetLastError=true,CharSet=CharSet.Unicode)] private static extern bool Process32NextW(IntPtr handle,ref Entry entry);
 [DllImport("kernel32.dll")] private static extern bool CloseHandle(IntPtr handle);
 public static OwnedQaProcessLink[] Snapshot() {
  IntPtr handle=CreateToolhelp32Snapshot(2,0);if(handle==new IntPtr(-1))throw new Win32Exception(Marshal.GetLastWin32Error());
  try {var rows=new List<OwnedQaProcessLink>();var entry=new Entry();entry.Size=(uint)Marshal.SizeOf(typeof(Entry));
   if(!Process32FirstW(handle,ref entry))throw new Win32Exception(Marshal.GetLastWin32Error());
   do {rows.Add(new OwnedQaProcessLink{ProcessId=entry.Id,ParentProcessId=entry.Parent});}while(Process32NextW(handle,ref entry));
   int error=Marshal.GetLastWin32Error();if(error!=18)throw new Win32Exception(error);return rows.ToArray();
  } finally {CloseHandle(handle);}
 }
}
'@
 }
 Write-OwnedPhase 'NATIVE'
 $all = [OwnedQaProcessTree]::Snapshot()
 $pending = [Collections.Generic.Queue[object]]::new()
 $pending.Enqueue(@{pid=$OwnedPid;startTicks=$rootTicks;depth=0})
 $found = [Collections.Generic.List[object]]::new()
 $seen = [Collections.Generic.HashSet[int]]::new()
 while ($pending.Count -gt 0) {
  $entry = $pending.Dequeue()
  if (-not $seen.Add([int]$entry.pid)) { continue }
  $proc = Get-Process -Id $entry.pid -ErrorAction SilentlyContinue
  if ((Get-StartTicks $proc) -ne $entry.startTicks) { continue }
  $found.Add($entry)
  foreach ($child in $all) {
   if ([int]$child.ParentProcessId -ne [int]$entry.pid) { continue }
   $childProc = Get-Process -Id ([int]$child.ProcessId) -ErrorAction SilentlyContinue
   if ($null -ne $childProc) {
    $childTicks = Get-StartTicks $childProc
    if ($childTicks -ne '' -and [long]$childTicks -ge [long]$entry.startTicks) { $pending.Enqueue(@{pid=[int]$child.ProcessId;startTicks=$childTicks;depth=([int]$entry.depth+1)}) }
   }
  }
 }
 $records = @()
 $ordered = if ($Mode -eq 'Stop') { @($found | Sort-Object { $_.depth } -Descending) } else { @($found) }
 foreach ($entry in $ordered) {
  $proc = Get-Process -Id $entry.pid -ErrorAction SilentlyContinue
  if ((Get-StartTicks $proc) -ne $entry.startTicks) { continue }
  if ($Mode -eq 'Limit') {
   $available = $proc.ProcessorAffinity.ToInt64(); [long]$mask=0; $count=0
   for ($bit=0; $bit -lt 63 -and $count -lt 2; $bit++) { [long]$flag=([long]1 -shl $bit); if (($available -band $flag) -ne 0) { $mask=$mask -bor $flag; $count++ } }
   if ($count -lt [Math]::Min(2,[Environment]::ProcessorCount)) { throw 'Cannot select two allowed CPUs for the owned process' }
   $proc.ProcessorAffinity = [IntPtr]$mask
   $proc.PriorityClass = [Diagnostics.ProcessPriorityClass]::BelowNormal
   $proc.Refresh()
   if ($proc.ProcessorAffinity.ToInt64() -ne $mask -or $proc.PriorityClass -ne [Diagnostics.ProcessPriorityClass]::BelowNormal) { throw 'Owned scheduler settings did not apply' }
  }
  $record = @{pid=[int]$entry.pid;startTicks=$entry.startTicks;depth=[int]$entry.depth}
  if ($Mode -eq 'Stop') { Stop-PinnedProcess -ProcessId ([int]$entry.pid) -StartTicks ([string]$entry.startTicks); $record.stopped=$true }
  else { $record.affinity=$proc.ProcessorAffinity.ToInt64().ToString(); $record.priority=$proc.PriorityClass.ToString() }
  $records += $record
 }
 @{result='PASS';pid=$OwnedPid;startTicks=$rootTicks;mode=$Mode;processes=@($records)} | ConvertTo-Json -Compress -Depth 6
} catch {
 @{result='FAIL';pid=$OwnedPid;mode=$Mode;error=($_.Exception.Message+' at line '+$_.InvocationInfo.ScriptLineNumber);processes=@()} | ConvertTo-Json -Compress -Depth 6
 exit 1
} finally {
 Write-OwnedPhase 'DONE'
}

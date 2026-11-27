param(
 [Parameter(Mandatory=$true)][ValidateSet('Birth','Inspect','Limit','Stop')][string]$Mode,
 [Parameter(Mandatory=$true)][ValidateRange(1,2147483647)][int]$OwnedPid,
 [string]$ExpectedStartTicks = '',
 [string]$PinnedProcessesJson = '',
 [switch]$Session,
 [string]$SessionToken = '',
 [string]$LedgerPath = ''
)
$ErrorActionPreference = 'Stop'
$script:requestId = 0
$script:requestSnapshot = $null
$script:known = @{}
function Write-SessionFrame($Value) {
 $text = ConvertTo-Json -InputObject $Value -Compress -Depth 8
 if ([Text.Encoding]::UTF8.GetByteCount($text) -gt 1048576) { throw 'Owned helper response exceeds1MiB' }
 [Console]::Out.WriteLine($text)
 [Console]::Out.Flush()
}
function Write-OwnedPhase([string]$Phase) {
 if ($Session) { Write-SessionFrame @{kind='phase';token=$SessionToken;id=$script:requestId;phase=$Phase;elapsedMs=$script:phaseClock.Elapsed.TotalMilliseconds} }
 else { [Console]::Error.WriteLine('OWNED_QA_PHASE ' + $Phase + ' ' + $script:phaseClock.Elapsed.TotalMilliseconds.ToString('F3',[Globalization.CultureInfo]::InvariantCulture)) }
}
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

function Initialize-OwnedInterop {
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
}
function Invoke-OwnedOperation {
 param([string]$Mode,[int]$OwnedPid,[string]$ExpectedStartTicks='', [string]$PinnedProcessesJson='')
 if (-not $Session) { $script:phaseClock=[Diagnostics.Stopwatch]::StartNew(); Write-OwnedPhase 'ENTER' }
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
  return
 }
 $owned = Get-Process -Id $OwnedPid -ErrorAction SilentlyContinue
 if ($null -eq $owned) { @{result='GONE';pid=$OwnedPid;processes=@()} | ConvertTo-Json -Compress -Depth 6; return }
 $rootTicks = Get-StartTicks $owned
 if ($rootTicks -eq '') { @{result='GONE';pid=$OwnedPid;processes=@()} | ConvertTo-Json -Compress -Depth 6; return }
 if ($ExpectedStartTicks -ne '' -and $ExpectedStartTicks -ne $rootTicks) { throw 'Owned PID start time changed; refusing process operation' }
 if ($Mode -eq 'Birth') { if ($Session) { Register-OwnedReceipts @(@{pid=$OwnedPid;startTicks=$rootTicks;depth=0}) }; @{result='PASS';pid=$OwnedPid;startTicks=$rootTicks;processes=@(@{pid=$OwnedPid;startTicks=$rootTicks;depth=0})} | ConvertTo-Json -Compress -Depth 6; return }
 if ($Mode -ne 'Inspect' -and $ExpectedStartTicks -eq '') { throw 'Mutations require the pinned owner start time' }
 # Enumerate ancestry, never process names. Every selected PID is pinned again
 # immediately before changing its scheduler or terminating it.
 Write-OwnedPhase 'INTEROP'
 Initialize-OwnedInterop
 Write-OwnedPhase 'NATIVE'
 $all = if ($Session) { $script:requestSnapshot } else { [OwnedQaProcessTree]::Snapshot() }
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
 if ($Session) { Register-OwnedReceipts @($found.ToArray()) }
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
 return
} finally {
 Write-OwnedPhase 'DONE'
}

}
function Save-OwnedLedger {
 $rows = @($script:known.Values | Sort-Object depth,pid,startTicks)
 $value = @{schema=1;token=$SessionToken;helperPid=$PID;helperStartTicks=$script:helperTicks;parentPid=$script:sessionOwnerPid;parentStartTicks=$script:parentTicks;processes=$rows}
 $text = ConvertTo-Json -InputObject $value -Compress -Depth 7
 if ([Text.Encoding]::UTF8.GetByteCount($text) -gt 1048576) { throw 'Owned helper ledger exceeds1MiB; previous receipts retained' }
 $pendingPath = $LedgerPath + '.pending'
 [IO.File]::WriteAllText($pendingPath,$text,[Text.UTF8Encoding]::new($false))
 if ([IO.File]::Exists($LedgerPath)) { [IO.File]::Replace($pendingPath,$LedgerPath,[NullString]::Value) }
 else { [IO.File]::Move($pendingPath,$LedgerPath) }
}
function Register-OwnedReceipts($Rows) {
 foreach ($row in @($Rows)) { $key = [string]$row.pid + ':' + [string]$row.startTicks; $script:known[$key] = @{pid=[int]$row.pid;startTicks=[string]$row.startTicks;depth=[int]$row.depth} }
 Save-OwnedLedger
 Write-SessionFrame @{kind='ledger';token=$SessionToken;id=$script:requestId;processes=@($script:known.Values)}
}
function Read-OwnedLine {
 $line = [Text.StringBuilder]::new()
 while ($true) {
  $code = [Console]::Read()
  if ($code -lt 0) { throw 'Owned helper input EOF' }
  if ($code -eq 10) { return $line.ToString() }
  if ($code -lt 32 -or $code -gt 126) { throw 'Owned helper requests must be ASCII JSON lines' }
  if ($line.Length -ge 1048576) { throw 'Owned helper request exceeds1MiB' }
  [void]$line.Append([char]$code)
 }
}
function Assert-Keys($Value,[string[]]$Keys) {
 if ($null -eq $Value -or $Value -is [array] -or $Value -isnot [pscustomobject]) { throw 'Owned helper request must be an object' }
 $actual = @($Value.PSObject.Properties.Name)
 if ($actual.Count -ne $Keys.Count) { throw 'Owned helper request key count' }
 foreach ($key in $actual) { if ($key -cnotin $Keys) { throw 'Unknown owned helper request key' } }
}
function Assert-Integer($Value,[int]$Minimum,[int]$Maximum) {
 if ($null -eq $Value -or $Value -is [string] -or $Value -is [bool] -or [double]$Value -ne [Math]::Truncate([double]$Value) -or [double]$Value -lt $Minimum -or [double]$Value -gt $Maximum) { throw 'Invalid owned helper integer' }
}
function Assert-SessionAncestry([int]$Target,[string]$Ticks,$Receipts) {
 if ((Get-StartTicks (Get-Process -Id $OwnedPid -ErrorAction SilentlyContinue)) -cne $script:parentTicks) { throw 'Session parent birth changed or exited' }
 if ($Target -eq $PID -or $Target -eq $OwnedPid) { throw 'Session cannot target itself or its owner' }
 if (@($Receipts).Count -gt 0) {
  if (-not $script:known.ContainsKey(([string]$Target+':'+$Ticks))) { throw 'Stop owner was never registered by this session' }
  foreach ($receipt in @($Receipts)) { if (-not $script:known.ContainsKey(([string]$receipt.pid+':'+[string]$receipt.startTicks))) { throw 'Stop receipt was never registered by this session' } }
  return $Ticks # Historical ancestry is retained for orphan cleanup; birth is rechecked by the original Stop path.
 }
 $targetProcess = Get-Process -Id $Target -ErrorAction SilentlyContinue
 if ($null -eq $targetProcess) { return '' }
 $childTicks = Get-StartTicks $targetProcess
 if ($childTicks -eq '') { return '' }
 $targetTicks = $childTicks
 if ($Ticks -ne '' -and $Ticks -cne $childTicks) { throw 'Owned PID start time changed; refusing process operation' }
 $links = @{}
 foreach ($link in $script:requestSnapshot) { $links[[string]$link.ProcessId] = [int]$link.ParentProcessId }
 $seen = [Collections.Generic.HashSet[int]]::new()
 $cursor = $Target
 while ($cursor -ne $OwnedPid) {
  if (-not $seen.Add($cursor) -or -not $links.ContainsKey([string]$cursor)) { throw 'Target is not a descendant of the session owner' }
  $parent = $links[[string]$cursor]
  $parentBirth = Get-StartTicks (Get-Process -Id $parent -ErrorAction SilentlyContinue)
  if ($parentBirth -eq '' -or [long]$childTicks -lt [long]$parentBirth) { throw 'Owned ancestry birth mismatch' }
  $cursor = $parent; $childTicks = $parentBirth
 }
 if ($childTicks -cne $script:parentTicks) { throw 'Session owner ancestry changed' }
 return $targetTicks
}
if (-not $Session) {
 if ($SessionToken -ne '' -or $LedgerPath -ne '') { throw 'Session-only arguments require Session' }
 $reply = Invoke-OwnedOperation -Mode $Mode -OwnedPid $OwnedPid -ExpectedStartTicks $ExpectedStartTicks -PinnedProcessesJson $PinnedProcessesJson
 Write-Output ([string]$reply)
 if ((ConvertFrom-Json -InputObject $reply).result -eq 'FAIL') { exit 1 }
 exit 0
}
try {
 if ($SessionToken -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' -or -not [IO.Path]::IsPathRooted($LedgerPath) -or [IO.File]::Exists($LedgerPath) -or [IO.File]::Exists($LedgerPath+'.pending')) { throw 'Invalid or nonfresh owned helper session binding' }
 [Console]::InputEncoding = [Text.UTF8Encoding]::new($false)
 [Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
 $self = Get-Process -Id $PID
 $script:helperTicks = Get-StartTicks $self
 $script:parentTicks = Get-StartTicks (Get-Process -Id $OwnedPid -ErrorAction Stop)
 if ($script:helperTicks -eq '' -or $script:parentTicks -eq '') { throw 'Session birth unavailable' }
 $available = $self.ProcessorAffinity.ToInt64(); [long]$mask=0; $count=0
 for ($bit=0; $bit -lt 63 -and $count -lt 2; $bit++) { [long]$flag=([long]1 -shl $bit); if (($available -band $flag) -ne 0) { $mask=$mask -bor $flag; $count++ } }
 if ($count -lt [Math]::Min(2,[Environment]::ProcessorCount)) { throw 'Cannot select two helper CPUs' }
 $self.ProcessorAffinity=[IntPtr]$mask; $self.PriorityClass=[Diagnostics.ProcessPriorityClass]::BelowNormal; $self.Refresh()
 if ($self.ProcessorAffinity.ToInt64() -ne $mask -or $self.PriorityClass -ne [Diagnostics.ProcessPriorityClass]::BelowNormal) { throw 'Helper scheduler settings did not apply' }
 $script:sessionOwnerPid=$OwnedPid
 Initialize-OwnedInterop
 $startupSnapshot = [OwnedQaProcessTree]::Snapshot()
 $selfLink = @($startupSnapshot | Where-Object { [int]$_.ProcessId -eq $PID })
 if ($selfLink.Count -ne 1 -or [int]$selfLink[0].ParentProcessId -ne $OwnedPid) { throw 'Helper parent is not its original owner' }
 Save-OwnedLedger
 Write-SessionFrame @{kind='ready';token=$SessionToken;pid=$PID;startTicks=$script:helperTicks;parentPid=$script:sessionOwnerPid;parentStartTicks=$script:parentTicks;affinity=$mask.ToString();priority=$self.PriorityClass.ToString()}
 $lastId=0
 while ($true) {
  $request = ConvertFrom-Json -InputObject (Read-OwnedLine)
  if ($request.kind -ceq 'close') { Assert-Keys $request @('kind','id','token') }
  else { Assert-Keys $request @('kind','id','token','mode','pid','startTicks','receipts') }
  Assert-Integer $request.id 1 2147483647
  if ([int]$request.id -ne $lastId+1 -or $request.token -cne $SessionToken) { throw 'Stale or foreign owned helper request' }
  $lastId=[int]$request.id; $script:requestId=$lastId
  if ($request.kind -ceq 'close') { Save-OwnedLedger; Write-SessionFrame @{kind='closed';token=$SessionToken;id=$lastId}; break }
  if ($request.kind -cne 'request' -or $request.mode -cnotin @('Birth','Inspect','Limit','Stop')) { throw 'Invalid owned helper mode' }
  Assert-Integer $request.pid 1 2147483647
  if ($request.startTicks -isnot [string] -or ($request.mode -ceq 'Birth' -and $request.startTicks -cne '') -or ($request.mode -cne 'Birth' -and $request.startTicks -notmatch '^\d+$') -or $request.receipts -isnot [array]) { throw 'Invalid owned helper birth or receipts' }
  if ($request.mode -cne 'Stop' -and $request.receipts.Count -ne 0) { throw 'Receipts accepted only for Stop' }
  foreach ($receipt in $request.receipts) { Assert-Keys $receipt @('pid','startTicks','depth'); Assert-Integer $receipt.pid 1 2147483647; Assert-Integer $receipt.depth 0 2147483647; if ($receipt.startTicks -isnot [string] -or $receipt.startTicks -notmatch '^\d+$') { throw 'Invalid receipt birth' } }
  $script:phaseClock=[Diagnostics.Stopwatch]::StartNew(); Write-OwnedPhase 'ENTER'
  $script:requestSnapshot = [OwnedQaProcessTree]::Snapshot() # New snapshot for EVERY operation, never cached between requests.
  $checkedTicks = Assert-SessionAncestry ([int]$request.pid) $request.startTicks $request.receipts
  $receiptJSON = if ($request.receipts.Count -gt 0) { ConvertTo-Json -InputObject @($request.receipts) -Compress -Depth 6 } else { '' }
  if ($request.receipts.Count -eq 0 -and $checkedTicks -eq '') { $value = @{result='GONE';pid=[int]$request.pid;processes=@()} | ConvertTo-Json -Compress -Depth 6; Write-OwnedPhase 'DONE' }
  else { $value = Invoke-OwnedOperation -Mode $request.mode -OwnedPid ([int]$request.pid) -ExpectedStartTicks $checkedTicks -PinnedProcessesJson $receiptJSON }
  $script:requestSnapshot = $null
  Write-SessionFrame @{kind='result';token=$SessionToken;id=$lastId;value=(ConvertFrom-Json -InputObject $value)}
 }
} catch {
 $script:requestSnapshot = $null
 try { Write-SessionFrame @{kind='fatal';token=$SessionToken;id=$script:requestId;error=[string]$_.Exception.Message} } catch { }
 exit 1
}

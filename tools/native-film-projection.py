"""IRBI overlay203:021be0d4..021be1fe native frustum calculation.

Descriptor[4] is Q12 aspect, NOT an angle. Native camera setup reads the
two degree fields[2:4], halves integer degrees, indexes the ARM9 sin/cos
table, then uses rounded Q12 multiplication and the SDK fixed division.
"""
import hashlib,struct
from irbi_reader import code_decompress


def fixed_mul(a,b):return (a*b+2048)>>12


def fixed_div(a,b):
    if a<0 or b<=0:raise ValueError('Positive native frustum division required')
    return (((a<<32)//b)+(1<<19))>>20


def trunc_div(a,b):return (abs(a)//abs(b))*(-1 if (a<0)!=(b<0) else 1)


def matrix_q12(bounds):
    # ARM9:0207c150, FX reciprocal retained at32 fractional bits until
    # each matrix coefficient is rounded. Quantization can turn the far
    # plane into an infinite plane; a floating unrounded matrix clips the
    # original sea/sky geometry and produces false black movie frames.
    l,r,b,t,n,f,w=[bounds[k] for k in ('left','right','bottom','top','near','far','wScale')]
    def coefficient(numerator,denominator):
        reciprocal=trunc_div(4096<<32,denominator)
        if w!=4096:reciprocal=trunc_div(reciprocal*w,4096)
        return (reciprocal*numerator+(1<<31))>>32
    return [coefficient(2*n,r-l),0,0,0,0,coefficient(2*n,t-b),0,0,
            coefficient(r+l,r-l),coefficient(t+b,t-b),coefficient(f+n,n-f),-w,
            0,0,coefficient(fixed_mul(2*n,f),n-f),0]


def projection(rom,descriptor):
    if len(descriptor)!=9:raise ValueError('Full nine-word camera descriptor required')
    arm=code_decompress(rom.arm9);base=rom.arm9RamAddress
    def pair(word):
        degrees=word>>12
        if not 1<=degrees<180:raise ValueError('Native movie FOV outside supported range')
        half=degrees//2;index=((half<<16)//360)>>4
        return struct.unpack_from('<2h',arm,0x20a1a30-base+index*4)
    sine=pair(descriptor[2])[0];cosine=pair(descriptor[3])[1]
    near,far,wscale=descriptor[5:8]
    if not 0<near<far or not 0<=wscale<=65536:raise ValueError('Unsupported native movie clipping/W scale')
    top=fixed_div(fixed_mul(near,sine),cosine)
    right=fixed_div(fixed_mul(fixed_mul(near,0x1555),sine),cosine)
    if min(top,right)<=0:raise ValueError('Degenerate native frustum')
    bounds={'left':-right,'right':right,'bottom':-top,'top':top,'near':near,'far':far,'wScale':wscale or 4096}
    offsets=list(struct.unpack('<2h',struct.pack('<I',descriptor[8])))
    screens=[matrix_q12({**bounds,'top':top+off,'bottom':-top+off}) for off in offsets]
    return {'sin':sine/4096,'cos':cosine/4096,'near':near/4096,'far':far/4096,
            'nativeFovQ12':descriptor[2:4],'nativeAspectQ12':0x1555,
            'nativeFrustumQ12':bounds,'nativeMatrixQ12':matrix_q12(bounds),
            'nativeScreenOffsetsQ12':offsets,'nativeScreenMatricesQ12':screens,
            'source':{'owner':'overlay203:021be0d4..021be1fe','sinCosTable':'ARM9:020a1a30','descriptorWords':descriptor,'arm9SHA256':hashlib.sha256(arm).hexdigest(),'fixedDivision':'ARM9:0207c6e8/0207c7ec/0207c8b0'}}

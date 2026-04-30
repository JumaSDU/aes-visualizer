const SBOX=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22];
const INV_SBOX=new Array(256).fill(0);
SBOX.forEach((v,i)=>{INV_SBOX[v]=i});
const MIX=[[2,3,1,1],[1,2,3,1],[1,1,2,3],[3,1,1,2]];
const INV_MIX=[[14,11,13,9],[9,14,11,13],[13,9,14,11],[11,13,9,14]];
const RCON=[0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1b,0x36];

function gmul(a,b){let p=0;for(let i=0;i<8;i++){if(b&1)p^=a;const hi=a&0x80;a=(a<<1)&0xff;if(hi)a^=0x1b;b>>=1}return p}
function strToBytes(s){const b=[];for(let i=0;i<16;i++)b.push(i<s.length?s.charCodeAt(i)&0xff:0);return b}
function hexToBytes(h){h=h.replace(/\s/g,'');const b=[];for(let i=0;i<h.length;i+=2)b.push(parseInt(h.substr(i,2),16));while(b.length<16)b.push(0);return b.slice(0,16)}
function bytesToMatrix(b){const m=[];for(let c=0;c<4;c++)m.push([b[c*4],b[c*4+1],b[c*4+2],b[c*4+3]]);return m}
function matrixToBytes(m){const b=[];for(let c=0;c<4;c++)for(let r=0;r<4;r++)b.push(m[c][r]);return b}
function snap(m){return matrixToBytes(m).map(b=>b.toString(16).padStart(2,'0').toUpperCase())}

function subBytes(s){return s.map(r=>r.map(b=>SBOX[b]))}
function invSubBytes(s){return s.map(r=>r.map(b=>INV_SBOX[b]))}
function shiftRows(s){
  const f=[[],[],[],[]];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)f[r].push(s[c][r]);
  for(let r=1;r<4;r++)for(let i=0;i<r;i++)f[r].push(f[r].shift());
  const o=[];for(let c=0;c<4;c++)o.push([f[0][c],f[1][c],f[2][c],f[3][c]]);return o;
}
function invShiftRows(s){
  const f=[[],[],[],[]];
  for(let r=0;r<4;r++)for(let c=0;c<4;c++)f[r].push(s[c][r]);
  for(let r=1;r<4;r++)for(let i=0;i<r;i++)f[r].unshift(f[r].pop());
  const o=[];for(let c=0;c<4;c++)o.push([f[0][c],f[1][c],f[2][c],f[3][c]]);return o;
}
function mixColumns(s,inv=false){
  const mc=inv?INV_MIX:MIX;
  return s.map(col=>mc.map(row=>row.reduce((a,m,i)=>a^gmul(col[i],m),0)));
}
function expandKey(kb){
  const w=[];
  for(let i=0;i<4;i++)w.push(kb.slice(i*4,i*4+4));
  for(let i=4;i<44;i++){
    let t=[...w[i-1]];
    if(i%4===0){t=[t[1],t[2],t[3],t[0]].map(b=>SBOX[b]);t[0]^=RCON[i/4-1]}
    w.push(t.map((b,j)=>b^w[i-4][j]));
  }
  return Array.from({length:11},(_,k)=>w.slice(k*4,k*4+4).flat());
}

export function encryptSteps(text, key) {
  const steps = [];
  let s = bytesToMatrix(strToBytes(text));
  const rks = expandKey(strToBytes(key.padEnd(16,'0').slice(0,16)));

  steps.push({ name:"Input", state: snap(s), formula:"P → 4×4 matrix", desc:"Plaintext placed into a 4×4 byte matrix (column-major order)." });

  let rk = bytesToMatrix(rks[0]);
  s = s.map((col,c)=>col.map((b,r)=>b^rk[c][r]));
  steps.push({ name:"AddRoundKey", state: snap(s), formula:"P ⊕ K₀", desc:"XOR every byte with the initial round key. Hides plaintext patterns before the main rounds." });

  for(let round=1;round<=10;round++){
    const p1=snap(s); s=subBytes(s);
    steps.push({ name:`SubBytes (R${round})`, state: snap(s), prev: p1, formula:"S-Box substitution", desc:"Each byte replaced by its AES S-Box value — non-linear substitution that defeats algebraic attacks." });

    const p2=snap(s); s=shiftRows(s);
    steps.push({ name:`ShiftRows (R${round})`, state: snap(s), prev: p2, formula:"Cyclic left shift", desc:"Row 0 stays, row 1 shifts 1, row 2 shifts 2, row 3 shifts 3. Spreads bytes across columns." });

    if(round<10){
      const p3=snap(s); s=mixColumns(s,false);
      steps.push({ name:`MixColumns (R${round})`, state: snap(s), prev: p3, formula:"GF(2⁸) multiply", desc:"Each column multiplied by a polynomial matrix in GF(2⁸). Every output byte depends on all 4 input bytes." });
    }

    rk=bytesToMatrix(rks[round]);
    const p4=snap(s); s=s.map((col,c)=>col.map((b,r)=>b^rk[c][r]));
    steps.push({ name:`AddRoundKey (R${round})`, state: snap(s), prev: p4, formula:`S ⊕ K${round}`, desc:`XOR with round key ${round}. Folds key material into every byte of the state.` });
  }

  const result = matrixToBytes(s).map(b=>b.toString(16).padStart(2,'0').toUpperCase()).join(' ');
  return { steps, result };
}

export function decryptSteps(text, key) {
  const steps = [];
  const hex = text.replace(/\s/g,'');
  if(!/^[0-9a-fA-F]{32}$/.test(hex)) {
    return { steps:[{name:"Error", state:[], formula:"", desc:"Input must be 32 hex characters from Encrypt output."}], result:"" };
  }
  let s = bytesToMatrix(hexToBytes(hex));
  const rks = expandKey(strToBytes(key.padEnd(16,'0').slice(0,16)));

  steps.push({ name:"Cipher Input", state: snap(s), formula:"C → matrix", desc:"Ciphertext hex loaded into the 4×4 state matrix. All operations will run in reverse order." });

  let rk = bytesToMatrix(rks[10]);
  s = s.map((col,c)=>col.map((b,r)=>b^rk[c][r]));
  steps.push({ name:"AddRoundKey (R10)", state: snap(s), formula:"C ⊕ K₁₀", desc:"XOR with round key 10 first — decryption uses round keys in reverse: 10 → 9 → … → 0." });

  for(let round=9;round>=0;round--){
    const p1=snap(s); s=invShiftRows(s);
    steps.push({ name:`InvShiftRows (R${round})`, state: snap(s), prev: p1, formula:"Cyclic right shift", desc:"Rows shifted right — exact inverse of encryption ShiftRows." });

    const p2=snap(s); s=invSubBytes(s);
    steps.push({ name:`InvSubBytes (R${round})`, state: snap(s), prev: p2, formula:"Inverse S-Box", desc:"Each byte passed through the inverse S-Box, reversing the non-linear substitution." });

    rk=bytesToMatrix(rks[round]);
    const p3=snap(s); s=s.map((col,c)=>col.map((b,r)=>b^rk[c][r]));
    steps.push({ name:`AddRoundKey (R${round})`, state: snap(s), prev: p3, formula:`S ⊕ K${round}`, desc:`XOR with round key ${round}. Since XOR is self-inverse, this undoes the encryption key mixing.` });

    if(round>0){
      const p4=snap(s); s=mixColumns(s,true);
      steps.push({ name:`InvMixColumns (R${round})`, state: snap(s), prev: p4, formula:"Inverse GF(2⁸)", desc:"Inverse MixColumns using the inverse polynomial matrix — undoes column mixing from encryption." });
    }
  }

  const plainBytes = matrixToBytes(s);
  const result = plainBytes.map(b=>b>=32&&b<=126?String.fromCharCode(b):'·').join('').replace(/·+$/,'');
  return { steps, result };
}
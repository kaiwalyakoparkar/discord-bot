const levelScale: number[] = [];

let j = 0;

for (let i = 0; i <= 100; i++) {
  j += i * 100;
  levelScale[i] = j;
}

export default levelScale;

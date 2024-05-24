![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

- express Batch를 통한 canvas2D 이미지 생성, 분류 // 웹 차트
- 라이브러리 사용의 최소화
- 학습용 json-data를 읽어 (dataset생성/feature추출/평가)순으로 진행. 이미지파일을 생성
- vanillaJS+ canvas를 활용하여 학습용 이미지 분석을 위한 커스텀 차트 구현
- batch-server와 web이 공용으로 사용하는 공통 local-package 생성
- 이미지set의 용량 문제로 api를 통해 데이터를 처리하지 않고 로컬 batch를 통해 이미지파일을
- 웹 public folder에 바로 생성하는 방식으로 구성

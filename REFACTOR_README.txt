KU STARTUP PLANNER 프론트엔드 리팩터링 패키지

변경 사항
- index.html에서 CSS와 JavaScript를 분리했습니다.
- 경제 전망 자료 품질을 담당하는 백엔드 로직은 유지했습니다.
- 경제 전망 UI에서 "영향도" 문구를 제거했습니다.
- 방향은 (+), (-), (±), (?) 형식으로 표시합니다.
- 참고자료의 반복적인 게시일·활용 이유 문구를 제거했습니다.
- background polling 구조와 24시간 캐시를 유지했습니다.

적용 방법
1. startup-planner-refactor-ready.zip을 작업 폴더에 덮어씁니다.
2. node_modules 폴더는 Git에 올리지 않습니다.
3. git status로 변경 사항을 확인합니다.
4. 배포 전 주요 기능을 테스트합니다.

스크립트 로드 순서
config.js -> data.js -> state.js -> utils.js -> auth.js -> form.js -> recommendations.js -> analysis.js -> forecast.js -> projects.js -> app.js

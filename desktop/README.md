# CATAKLEM 데스크톱 (스팀용)

게임 페이지를 Electron으로 감싼 윈도우 실행 파일을 만든다.

## 처음 한 번

1. Node.js LTS를 설치한다. https://nodejs.org
2. 이 폴더에서 터미널을 열고:

```
npm install
```

## 실행해 보기

```
npm run fonts
npm start
```

`npm run fonts`는 글꼴을 한 번 내려받아 `app/fonts`에 저장한다. 그래야 인터넷 없이도 글꼴이 제대로 나온다.

## 스팀에 올릴 파일 만들기

```
npm run dist
```

`dist/win-unpacked` 폴더가 생긴다. 이 폴더 전체를 Steamworks의 SteamPipe로 올리면 된다. 실행 파일은 `CATAKLEM.exe`.

게임을 고친 뒤에는 저장소 맨 위에서 `bash build.sh`를 다시 돌리면 `desktop/app/index.html`이 새로 만들어진다.

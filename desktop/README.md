# CATAKLEM 데스크톱 (스팀용)

게임 페이지를 Electron으로 감싼 윈도우 실행 파일을 만든다.

## 만들기

1. 저장소 맨 위에서 게임을 빌드한다: `bash build.sh`
   이때 `desktop/app/index.html`이 새로 만들어진다.
2. 이 폴더에서 PowerShell로:

```
powershell -ExecutionPolicy Bypass -File make.ps1
```

결과는 OneDrive 밖의 `%USERPROFILE%\cataklem-desktop\dist\win-unpacked` 폴더에 생긴다.
이 폴더 전체를 Steamworks의 SteamPipe로 올리면 된다. 실행 파일은 `CATAKLEM.exe`.

## 알아 둘 것

- 빌드는 일부러 OneDrive 밖에서 한다. node_modules 수천 개 파일이 OneDrive에 동기화되지 않게 하려는 것.
- 글꼴은 처음 빌드할 때 한 번 내려받아 `app/fonts`에 넣는다. 그래서 인터넷 없이도 글꼴이 나온다.
- Electron의 자체 압축 풀기가 최신 Node에서 중간에 멈추는 문제가 있어서, `make.ps1`은 내려받은 zip을 윈도우 기능으로 직접 푼다.
- 실행 파일 서명은 껐다. 스팀 배포에는 필요 없다.

---
slug: oauth
title: OAuth
---

사이드 프로젝트를 하며 로그인 기능을 구현하게 되었다. 프로젝트 시작 전엔 자체 로그인 기능을 구상했다.
하지만 프로젝트 기간을 기획/디자인/개발을 포함해서 최대 5주로 잡았기 때문에, 자체 로그인을 구현하는 건 시간적으로 쉽지 않다는 판단을 내렸다. 로그인만 만들다가 끝날 수는 없다.
동시에 초반엔 기획과 디자인도 함께 해야 하는 상황이었고, 프로젝트를 위한 팀원 모집도 완료가 되지 않은 상태였다.

<!-- truncate -->

결과적으로, MVP에는 소셜 로그인 1개만 들어가게 되었다.
물론 이 과정에 팀원분들도 로그인에 공을 들이기 보다는, 주요 기능에 집중하는 게 맞다는 데 동의해 주셨다.
가장 많이 쓰는 소셜 로그인으로는 카톡/네이버/구글이 있었고, 사용자가 가장 접하기 쉬운 SNS를 선택 기준으로 삼았다.
그렇게 가장 유저 접근성이 좋다고 판단한, 카톡 로그인으로 구현하게 되었다.

근데 여기서 의문이 생겼다.
자체 로그인은 스펙이 커서 보류했지만, OAuth 방식의 로그인이 어떤 장점이 있길래 요즘 대부분의 서비스에서 OAuth를 사용하는 것일까?
물론 사용자 측에서는 편한 것은 알겠는데, 단순히 그 장점 하나 때문에 제공자 측에서 이 기능을 사용하는 것은 아닐 것 같았다.
그렇게 OAuth가 무엇인지 찾아보게 되었다.

## OAuth란

정의는 기본적으로 아래와 같았다.

> OAuth는 인터넷 사용자들이 패스워드를 제공하지 않고 다른 웹사이트 상의 자신들의 정보에 대해 웹사이트나 애플리케이션의 접근 권한을 부여할 수 있는 공통적인 수단으로서 사용되는, 접근 위임을 위한 개방형 표준이다.
>
> _- [Wikipedia OAuth](https://ko.wikipedia.org/wiki/OAuth)_

하지만 이 정의만으로는 OAuth를 이해하긴 어려웠다. 그래서 OAuth 문서([RFC 5849](https://datatracker.ietf.org/doc/html/rfc5849), [RFC 6749](https://datatracker.ietf.org/doc/html/rfc674))를 찾아보게 되었다.

## OAuth의 배경

<details open>
  <summary>[RFC 5849](https://datatracker.ietf.org/doc/html/rfc5849), [RFC 6749](https://datatracker.ietf.org/doc/html/rfc674) Introduction 요약</summary>

-   OAuth는 '특정 사용자의 데이터를 안전하게 활용할 수 있는 방법'으로 등장했다.
-   OAuth 모델은 사용자가 아이디와 패스워드를 직접 입력하지 않고도, 제한된 권한을 부여받아 안전하게 접근할 수 있는 방식을 제시한다.
-   기존 인증 방식은 사용자의 계정 정보를 서버에 직접 입력해야 했고, 이 부분에 보안 취약점이 있었다.
-   이런 문제를 해결하기 위해 OAuth는 기존 클라이언트-서버 인증 모델에 '리소스 소유자(Resource Owner)'라는 개념을 도입했다.
-   여기서 리소스 소유자는 인증 과정을 직접 수행하고, 애플리케이션에는 제한된 접근 권한을 주게 된다.
-   즉, OAuth의 주요 메커니즘은 사용자의 아이디와 패스워드를 직접 공유하는 대신 토큰을 사용하여 서버 자원에 안전하게 접근하도록 하는 것이다.
-   OAuth 1.0에서는 실무에서 확장성과 유지보수에 어려움이 있었고, 이를 개선한 OAuth 2.0이 도입되어 현재는 더 다양한 인증 시나리오를 지원하고 있다.

</details>

OAuth의 등장 이유는 당연하게도 기존 방식의 불편함이었다.
OAuth 이전 인증은 아이디와 패스워드를 사용자가 직접 입력하는 방식이었고, 이 방식에는 표준이 없었다.
또한, 서비스 제공자가 사용자의 패스워드를 직접 보관하기 때문에, 보안상 취약하고 계정 탈취 위험도 컸다.
OAuth는 이러한 문제를 해결하기 위해 등장한 표준화된 인증 방식이다.
사용자의 계정 정보를 직접 공유하지 않고도, 토큰을 사용하여 서버 자원에 안전하게 접근할 수 있도록 설계되었다.

## OAuth의 주요 개념 (Role)

| 이름                             | 내용                                                                                                                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Resource Owner (리소스 소유자)   | 보호된 리소스에 대한 접근을 승인할 수 있는 개체. 리소스의 원래 소유자이다. 일반적으로 이는 사용자를 의미한다.                              |
| Resource Server (리소스 서버)    | 제한된 리소스를 호스팅하는 서버. 사용자의 데이터를 저장하고 있는 곳으로, 클라이언트가 이 서버를 통해 데이터에 접근한다.                    |
| Client (클라이언트)              | 인가를 이용하여 리소스 소유자를 대신해 제한된 리소스 요청을 만드는 애플리케이션. 즉, 사용자의 리소스에 접근하려는 애플리케이션을 의미한다. |
| Authorization Server (인가 서버) | 리소스 소유자를 성공적으로 인증하고 인가를 얻은 뒤 클라이언트에게 접근 토큰을 발급하는 서버.                                               |

## 인증과 인가의 차이

그럼 인증과 인가는 무슨 차이일까.

인증이란 Authentication으로 쉽게 말해 '너 누구야'를 파악하는 것이다. 즉, 현재 페이지에 접속한 유저가 누구인지 확인하는 것을 의미한다.
인가란 Authorization으로 '어떤 유저(User)가, 어떤 리소스(Resource)에, 어떤 액션(Action)을 수행할 권한이 있는지 확인하는 것'이라고 할 수 있다.

주로 인증은 프론트엔드의 역할이고, 인가는 백엔드의 역할로 볼 수 있다.

## Authorization Code Flow

![oauth sequence diagram](./oauth_sequence_diagram.png)

<!-- ```mermaid
sequenceDiagram
participant User as 사용자 (Resource Owner)
participant Client as 내 애플리케이션 (Client)
participant AuthServer as 인가 서버 (Authorization Server)
participant ResourceServer as 리소스 서버 (Resource Server)

User->>Client: 로그인 버튼 클릭
Client->>AuthServer: client_id, redirect_uri 포함하여 인증 요청
AuthServer->>User: 로그인 및 권한 부여 요청
User->>AuthServer: 로그인 및 정보 제공 동의
AuthServer->>Client: 인가 코드 발급 (redirect_uri로 리다이렉트)

Client->>AuthServer: client_id, client_secret, redirect_uri, 인가 코드 포함하여 Access Token 요청
AuthServer->>Client: Access Token 및 Refresh Token 발급

Client->>ResourceServer: Access Token 포함하여 데이터 요청
ResourceServer->>Client: 요청된 데이터 반환
``` -->

1. 사전 작업
    - 인가 서버(카카오)에 클라이언트(내 애플리케이션) 등록
    - 인가 서버는 클라이언트에 `client_id`, `client_secret` 을 발급
    - 클라이언트에서 허용할 `redirect_uri` 등록
2. 로그인 페이지로의 접근
    - 사용자가 클라이언트의 로그인 버튼 클릭 → 클라이언트는 쿼리 파라미터에 `client_id` 와 `redirect_uri` 를 담아, 인가 서버의 엔드포인트로 리다이렉트
    - 인가 서버는 `client_id`와 `redirect_uri`가 유효한지 체크하고, 사용자에게 로그인 및 권한 부여 화면(로그인 창)을 보여준다.
    - 사용자가 로그인 후 정보 제공에 동의하면, 인가 서버는 인가 코드를 발급해 `redirect_uri` 로 클라이언트에 반환 및 리다이렉트 시킨다.
3. 접근 토큰 요청
    - 클라이언트는 `client_id`, `client_secret`, `redirect_uri`, 인가 코드를 포함해 인가 서버의 토큰 엔드포인트로 토큰 요청
    - 인가 서버는 확인 후 Access Token 및 Refresh Token을 클라이언트에 반환한다
4. 사용자 인증 및 세션 유지
    - 클라이언트는 인가 서버의 Access Token을 저장
    - Access Token을 사용해 리소스 서버에서 데이터를 가져온다.

## 프로젝트 적용하기

OAuth 로그인 구현은 크게 2가지 방식이 있다.

1. 프론트 중심 방식 (프론트에서 Access Token 발급 후 전달)

    - 프론트에서 OAuth 카카오 인가 서버에 로그인 요청
    - 로그인 성공 후, Access Token을 프론트에서 직접 수신
    - 프론트는 받은 Access Token을 백엔드로 전달하여 회원가입 및 로그인 처리 요청
    - 백엔드는 이 Access Token을 이용해 OAuth Provider에서 사용자 정보를 조회

2. 백엔드 중심 방식 (백엔드에서 OAuth 2.0 플로우 처리)

    - 프론트는 단순히 백엔드의 OAuth 로그인 API를 호출
    - 백엔드가 OAuth 2.0 Provider로 리다이렉트
    - 인증 성공 후, Authorization Code를 백엔드에서 직접 받아 Access Token 요청
    - 백엔드에서 Access Token과 Refresh Token을 저장 및 관리
    - 프론트에는 세션 또는 자체 발급 JWT만 제공하여 인증 유지

### 잘못된 방식의 구현

초기 작업을 할 때 놓친 것이 있었다.
프론트엔드인 나는 1번 방식을 생각했고, 백엔드 분은 2번 방식을 생각한 것이다.
결과적으로 이 두가지 방식이 섞인 혼합된 로그인이 탄생했다.

3. 프백 혼합 방식의 탄생

    - 프론트에서 OAuth 카카오 인가 서버에 로그인 요청
    - 인증 성공 후, Authorization Code를 백엔드에서 직접 받아 Access Token 요청
    - 백엔드에서 Access Token과 Refresh Token을 발급 받음
    - 백엔드가 프론트로 리다이렉트 & URL에 Access Token 포함
    - 프론트가 API 요청 시 Access Token을 백엔드에 전달

<details>
  <summary>서버에서 리다이렉트를 해주면, 프론트에서 URL로 받는 Access Token과 Refresh Token</summary>

    ![리다이렉트](./1_redirect.png)
    ![인가 코드](./2_authorization_code.png)
    ![URL로 받는 Access Token과 Refresh Token](./3_token.png)

</details>

:::danger 발생한 문제점

-   URL을 통해 Access Token & Refresh Token이 그대로 노출
-   Refresh Token이 유출되면 장기적인 계정 탈취 가능
-   Refresh Token이 프론트에서 관리되면 XSS 공격에 취약해짐
-   프론트에서는 Access Token을 다루지 않고, JWT 또는 세션을 사용해야 함

:::

### 어떻게 개선해야 할까

우선 보안을 생각하면 2번 방식으로 진행하는게 맞다.
하지만 현재 프로젝트가 어느정도 완성된 상태이기 때문에, 처음부터 재설계를 하기는 어렵다.
기존 구조를 유지하며, 개선할 수 있는 최선의 방법을 구상해보았다.

구상 1.

-   프론트에서 카카오 로그인 페이지로 리다이렉트
-   카카오 인가 서버에서 인가 코드 발급 후 프론트로 리다이렉트
-   프론트에서 인가 코드를 추출 후 백엔드로 보내 Access Token 발급 요청
-   백엔드가 카카오 OAuth 서버에 Access Token 요청 및 수신
-   백엔드가 Access Token을 프론트에 반환
-   프론트는 Access Token을 저장하여 이후 API 요청에 사용

구상 2. HttpOnly Secure 쿠키 활용

-   프론트에서 카카오 로그인 페이지로 리다이렉트
-   카카오 인가 서버에서 인가 코드 발급 후 프론트로 리다이렉트
-   프론트에서 인가 코드를 추출 후 백엔드로 Access Token 발급 요청
-   백엔드가 카카오 OAuth 서버에 Access Token 요청 및 수신
-   백엔드가 Access Token과 Refresh Token을 HttpOnly Secure 쿠키에 저장하여 반환
-   프론트는 Access Token을 직접 다루지 않고, API 요청 시 자동으로 쿠키가 포함되어 인증 유지

더 나은 대안에 대해 여러 구상을 하던 중 Best Practice가 무엇일지 궁금해졌다.
분명 Best Practice가 있을 것 같았기 때문이다.
그렇게 구글링을 하던 중 PKCE(Proof Key for Code Exchange)라는 것을 알게 되었다.
찾아보니 PKCE는 OAuth 2.1에서는 필수로 권고되는 보안 확장이라고 한다. 그럼 PKCE란 무엇이길래 OAuth 2.1에서 필수로 권고되는 걸까?

## PKCE란 무엇인가

> PKCE was originally designed to protect the authorization code flow in mobile apps, and was later recommended to be used by single-page apps as well. In later years, it was recognized that its ability to prevent authorization code injection makes it useful for every type of OAuth client, even apps running on a web server that use a client secret. Because of its history in the use of mobile apps and single-page apps, it is sometimes incorrectly thought that PKCE is an alternative to a client secret. However PKCE is not a replacement for a client secret, and PKCE is recommended even if a client is using a client secret, since apps with a client secret are still susceptible to authorization code injection attacks.
>
> _- [Okta의 RFC7636 문서 요약](https://www.oauth.com/oauth2-servers/pkce/)_

PKCE("[pixy](https://datatracker.ietf.org/doc/html/rfc7636)"로 발음)는 원래 모바일 앱에서 인가 코드 흐름(Authorization Code Flow)을 보호하기 위해 설계되었고, 이후 싱글 페이지 애플리케이션(SPA)에서도 사용하도록 권장되었다.
그리고 몇 년 후 인가 코드 주입(Authorization Code Injection) 공격을 방지할 수 있다는 점에서 모든 유형의 OAuth 클라이언트에 유용하다는 사실이 확인된다.
심지어 Client Secret을 사용하는 웹 서버 기반 애플리케이션에서도 마찬가지이다.

PKCE가 모바일 앱과 SPA에서 먼저 사용되었기 때문에, 종종 Client Secret의 대안으로 오해받기도 한다.
하지만 PKCE는 Client Secret을 대체하는 개념이 아니다.
오히려 Client Secret을 사용하는 애플리케이션조차도 인가 코드 주입 공격에 취약할 수 있기 때문에, PKCE는 Client Secret을 사용하더라도 함께 적용하는 것이 권장된다.

예를 들면, 기존의 OAuth 방식엔 아래와 같은 인가 코드 주입 공격 시나리오가 생길 수 있다. ([RFC 9700 - 4.5. Authorization Code Injection](https://datatracker.ietf.org/doc/rfc9700))

### Authorization Code Injection Attack

![authorization code injection](./authorization_code_injection.png)

<!-- ```mermaid
sequenceDiagram
    participant A as 공격자
    participant U as 피해자
    participant F as 프론트엔드
    participant B as 백엔드
    participant I as 인가 서버 (Authorization Server)

    U->>F: 1. 로그인 요청
    F->>I: 2. 인가 코드 요청 (정상적인 OAuth 플로우)
    I->>F: 3. 인가 코드 발급
    F->>B: 4. 인가 코드 전달 (백엔드로 전송)

    Note over A: 5. 인가 코드 탈취
    A->>B: 6. 탈취한 인가 코드로 Access Token 요청
    B->>I: 7. 백엔드가 인가 코드 검증 후 Access Token 요청 (client_secret 포함)
    I->>B: 8. Access Token 발급 (정상적인 인가 코드라 판단)
    B->>A: 9. 공격자의 Access Token 획득
    A->>B: 10. 공격자가 피해자의 계정으로 API 요청 (OAuth 인증 성공)
``` -->

인가 코드 주입 공격 시나리오

-   공격자가 피해자의 인가 코드(Authorization Code)를 탈취한다.
-   공격자는 탈취한 인가 코드를 이용해 백엔드로 요청을 보낸다.
-   백엔드는 정상적인 인가 코드라 판단하고, `client_secret`을 사용해 Access Token을 인가 서버로 요청한다.
-   결과적으로 공격자는 피해자의 계정으로 로그인 할 수 있게 된다.

즉, 인가 코드만 탈취하면 `client_secret`을 몰라도 정상적인 백엔드 서버를 이용해 Access Token을 받을 수 있는 것이다. 이때 PKCE를 사용하면 이러한 인가 코드 주입 공격을 방지할 수 있다.

PKCE의 기본적인 방식은 아래와 같다.

### Authorization Code Flow with PKCE

![pkce rfc7636](./pkce_rfc7636.png)

![pkce](./pkce.png)

<!-- ```mermaid
sequenceDiagram
    participant Client as 내 애플리케이션 (Client)
    participant AuthServer as 인가 서버 (Authorization Server)

    Client->>Client: 1. code_verifier 생성
    Client->>Client: 2. code_verifier를 SHA-256 해싱 → code_challenge 생성
    Client->>AuthServer: 3. 로그인 요청 (client_id, redirect_uri, code_challenge, code_challenge_method)
    AuthServer->>AuthServer: 4. client_id, redirect_uri 유효성 검증
    AuthServer->>Client: 5. 로그인 페이지 표시
    Client->>AuthServer: 6. 사용자 로그인
    AuthServer->>Client: 7. redirect_uri로 인가 코드 전달
    Client->>AuthServer: 8. Access Token 요청 (인가 코드, code_verifier)
    AuthServer->>AuthServer: 9. code_verifier 해싱 → 로그인 요청시 받은 code_challenge와 일치 여부 확인
    AuthServer->>Client: 10. Access Token 반환
``` -->

구상 3. OAuth 2.0 + PKCE 적용

-   로그인 페이지로 접근한다.
-   랜덤한 문자를 생성하고 `code_verifier`라 한다.
-   `code_verifier`를 SHA-256 해싱한 뒤 `code_challenge`를 만든다.
-   로그인 요청을 보낼 때, 쿼리 파라미터에 `client_id`, `redirect_uri`, `code_challenge`, `code_challenge_method`를 담아서 인가 서버로 보낸다.
-   인가 서버는 `client_id`와 `redirect_uri`가 유효한지 확인하고, 유효하면 로그인 창을 띄운다.
-   사용자가 로그인하면, 인가 서버는 `redirect_uri`로 인가 코드(일회용)를 담아서 내 애플리케이션으로 리다이렉트한다.
-   내 애플리케이션에서 받은 인가 코드와 저장해 두었던 `code_verifier`를 인가 서버로 보내 Access Token을 요청한다.
-   인가 서버는 `code_verifier`를 같은 알고리즘으로 해싱하여, 인가 코드 생성 시 받은 `code_challenge`와 일치하는지 확인한다.
-   검증이 되면, 인가 서버가 Access Token을 반환한다.

한마디로 PKCE는 공격자에게 인가 코드를 탈취당했을 경우를 대비해 클라이언트와 인가 서버가 서로 동일한 문자열을 공유하며, 해당 문자열을 암호화한 값을 주고받으며 위조 및 탈취를 방지하는 것이다.

## 프로젝트 개선하기

### 개선안 비교

현 상황에서 어떤 방식을 적용하는 게 좋을지 기존 방식, 구상 1, 구상 2, 구상 3을 표로 작성해보았다.

| -                      | **기존**                        | **구상 1**          | **구상 2**                    | **구상 3**          |
| ---------------------- | ------------------------------- | ------------------- | ----------------------------- | ------------------- |
| **방식**               | URL로 Access/Refresh Token 전달 | 프론트 저장         | HttpOnly Secure 쿠키          | PKCE                |
| **보안 수준**          | 매우 낮음                       | 낮음                | 높음                          | 중간                |
| **Access Token 저장**  | 프론트엔드                      | 프론트엔드          | 백엔드 쿠키(HttpOnly, Secure) | 프론트엔드          |
| **Refresh Token 저장** | 프론트엔드                      | 프론트엔드          | 백엔드 쿠키(HttpOnly, Secure) | 저장 안함           |
| **CSRF 방어**          | 불가능                          | 불가능              | 가능                          | `state` 사용시 가능 |
| **Token 탈취 위험**    | 매우 높음 (URL 노출)            | 높음 (프론트 저장)  | 낮음 (백엔드 보안)            | 중간                |
| **FE 변경 요구 사항**  | -                               | 토큰 전달 방식 변경 | 쿠키 방식 적용                | PKCE 적용           |
| **BE 변경 요구 사항**  | -                               | 토큰 전달 방식 변경 | 쿠키 처리                     | PKCE 처리           |
| **OAuth 표준 준수**    | 위반                            | 부분                | 부분                          | 준수                |

### 기존 방식

<br/>

```mermaid

sequenceDiagram
    participant User as 사용자
    participant Frontend as 프론트엔드
    participant AuthServer as 카카오 인가 서버
    participant Backend as 백엔드 (API 서버)

    User ->> Frontend: 1. 로그인 버튼 클릭
    Frontend ->> AuthServer: 2. OAuth 인증 요청 (client_id, redirect_uri 포함)
    AuthServer ->> Backend: 3. 인가 코드(code) 포함하여 리다이렉트

    Backend ->> AuthServer: 4. 인가 코드로 Access Token 요청
    AuthServer ->> Backend: 5. Access Token, Refresh Token 반환
    Backend ->> Frontend: 6. Access Token, Refresh Token 포함하여 리디렉트

    Frontend ->> Frontend: 7. URL에서 Access Token, Refresh Token 추출
    Frontend ->> Frontend: 8. setTokens(Access Token, Refresh Token, userId) 저장
    Frontend ->> User: 9. 로그인 완료 (저장된 토큰 사용)

```

<br/>

```tsx title="/src/pages/auth/LoginPage.tsx"
const KAKAO_CLIENT_ID = "eeerandomclientid1234sample0o0o0";
// 1. 서버에서 직접 인가 코드 처리 후 accessToken, refreshToken을 URL로 반환
// highlight-start
const KAKAO_REDIRECT_URI =
    "http://api.haeyum.com/oauth/kakao/authorize/fallback";
// highlight-end

const LoginPage = () => {
    const handleRedirectToKakao = () => {
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
        window.location.href = kakaoAuthUrl;
    };

    return (
        <FixedBottom>
            <Button onClick={handleRedirectToKakao}>
                <KakaoIcon
                    src={IconKakao}
                    alt="카카오 로그인"
                    role="presentation"
                />
                <span>카카오 로그인</span>
            </Button>
        </FixedBottom>
    );
};
```

```tsx title="/src/pages/auth/CallbackPage.tsx"
useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // 2. URL에서 accessToken, refreshToken을 받아 저장 -> URL에 Token 노출
    // highlight-start
    const accessToken = urlParams.get("accessToken");
    const refreshToken = urlParams.get("refreshToken");
    // highlight-end
    const userId = urlParams.get("socialSub");

    if (accessToken && refreshToken && userId) {
        setTokens(accessToken, refreshToken, userId);
        navigate("/");
    } else {
        setErrorMessage("토큰이 없습니다.");
        navigate("/login");
    }
}, [navigate, setTokens]);
```

### 구상 1 적용

중요한 것은 기존의 저장 방식은 보안에 특히 취약하다는 점이다. 가장 빠르게 변경할 수 있는 구상 1을 우선적으로 적용해 보았다.

<br/>

```mermaid

sequenceDiagram
    participant User as 사용자
    participant Frontend as 프론트엔드
    participant AuthServer as 카카오 인가 서버
    participant Backend as 백엔드 (API 서버)

    User ->> Frontend: 1. 로그인 버튼 클릭
    Frontend ->> AuthServer: 2. OAuth 인증 요청 (client_id, redirect_uri 포함)
    AuthServer ->> Frontend: 3. 인가 코드(code) 포함하여 리다이렉트

    Frontend ->> Backend: 4. POST로 인가 코드를 body에 담아 전달
    Backend ->> AuthServer: 5. 인가 코드로 Access Token 요청
    AuthServer ->> Backend: 6. Access Token, Refresh Token 반환
    Backend ->> Frontend: 7. Access Token, Refresh Token 응답 (JSON)

    Frontend ->> Frontend: 8. setTokens(Access Token, Refresh Token, userId) 저장
    Frontend ->> User: 9. 로그인 완료 (저장된 토큰 사용)

```

<br/>

```tsx title="/src/pages/auth/LoginPage.tsx"
const KAKAO_CLIENT_ID = "eeerandomclientid1234sample0o0o0";
// 1. 프론트엔드에서 인가 코드 직접 처리
// highlight-start
const KAKAO_REDIRECT_URI =
    "https://www.haeyum.kr/oauth/kakao/authorize/fallback";
// highlight-end

const LoginPage = () => {
    const handleRedirectToKakao = () => {
        const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}`;
        window.location.href = kakaoAuthUrl;
    };

    return (
        <FixedBottom>
            <Button onClick={handleRedirectToKakao}>
                <KakaoIcon
                    src={IconKakao}
                    alt="카카오 로그인"
                    role="presentation"
                />
                <span>카카오 로그인</span>
            </Button>
        </FixedBottom>
    );
};
```

```tsx title="/src/pages/auth/CallbackPage.tsx"
useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    // 2. URL에서 인가 코드(code) 받아와 서버에 토큰 요청
    // highlight-next-line
    const code = urlParams.get("code");

    if (!code) {
        setErrorMessage("인증 코드가 없습니다.");
        navigate("/login");
        return;
    }

    mutate(code, {
        onSuccess: (data) => {
            const { accessToken, refreshToken, socialSub: userId } = data;

            if (!accessToken || !refreshToken || !userId) {
                throw new Error("토큰 값을 확인해주세요.");
            }

            // 4. 기존 방식과 동일하지만, 토큰을 서버에서 받아와 프론트에 저장
            // highlight-next-line
            setTokens(accessToken, refreshToken, userId);
            navigate("/");
        },
        onError: () => {
            setErrorMessage("로그인 중 오류가 발생했습니다.");
            navigate("/login");
        },
    });
}, [navigate, mutate, setTokens]);
```

```tsx title="/src/common/apis/user/index.ts"
// 3. POST body에 인가 코드(code) 전달 -> HTTPS 사용시 body가 암호화되어 code 노출 위험 감소
export const userApi = {
    postAuthCode: async (code: string) => {
        // highlight-start
        const response = await privateApiInstance.post<TokenResponse>(
            "/oauth/kakao/login",
            { code }
        );
        // highlight-end
        return response.data;
    },
};
```

OAuth 인증 과정에서 URL에 토큰이 노출되는 상황은 구상 1을 적용해 막을 수 있었다.
하지만 여전히 인가 코드 탈취 가능성이 높고 CSRF 공격에도 취약한 상태였다.
이를 보완하기 위해 PKCE를 적용하는 구상 3을 도입하기로 했다.

### 구상 3 적용

구상 1로 구현해 배포한 후, OAuth 표준에 맞는 PKCE를 적용하기 위한 작업에 들어갔다. PKCE인 구상 3을 적용하려면 프론트엔드와 백엔드 모두 수정해야 했다.

#### PKCE 가이드 부족 문제

PKCE 적용 과정에서 가장 큰 어려움은 PKCE 관련 가이드가 부족하다는 점이었다.

![카카오 PKCE Dev Talk](./kakao_dev_talk.png)

카카오 개발 문서에도 관련 내용에 대한 친절한 가이드는 없었고, 위
[카카오 PKCE Dev Talk](https://devtalk.kakao.com/t/code-challenge-code-verifier/136785) 내용을 참고해 [구글 로그인 문서](https://developers.google.com/identity/protocols/oauth2/native-app)를 기반으로 구현하였다.

초기 설계 단계였다면 원하는 방향으로 쉽게 설계하고 구현할 수 있었겠지만, 이번 경우는 기존의 코드 구조를 유지하면서 동시에 보안적 측면에서 최선의 방법을 찾아야 했다.
개선 이전의 상태는 프론트에서 POST를 통해 인가 코드를 백엔드로 보내고, 백엔드는 이를 처리해 `access_token`과 `user_id`를 프론트로 반환하는 구조였다.

-   기존 구현된 방식 (구상 1 적용 상태)

1. 프론트엔드에서 OAuth 인가 코드(`code`)를 발급받아, 이를 POST 요청으로 백엔드에 전달
2. 백엔드에서 해당 코드를 이용해 `access_token`과 `user_id`를 발급 후 프론트엔드로 반환

하지만 PKCE를 도입하면서 `access_token`이 프론트로 직접 들어오게 되었고, 동시에 `id_token`도 프론트로 직접 들어오는 상황이 되었다.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="payload" label="Token Payload">

    ```text title="payload - https://kauth.kakao.com/oauth/token"
    grant_type: authorization_code
    client_id: eeeclientidexamplea6d87feeef0261
    redirect_uri: http://localhost:3000/oauth/kakao/authorize/fallback
    code: HucLFZ8ovAD5b4iXxDqX98DseaEsWXdmZESzVeMxLgViWQjPCF3S8wAAAAQKKiWPAAABlQ5fwidtZc76WqiBKA
    code_verifier: pe_eSZ2QQXKlfmJG7Rp0g4uAp4iC8a6ZnItUgZrXdes
    ```

  </TabItem>
  <TabItem value="response" label="Token Response" default>

    ```json title="response - https://kauth.kakao.com/oauth/token"
    {
        // highlight-next-line
        "access_token": "g2d3n6O7O9ph6wbyHdgYl6bINw7xl1VqAAAAAQo8JCAAAAGVDAAAAAL4plhSrbcM",
        "token_type": "bearer",
        "refresh_token": "9k0Dq-IlLwE8mLhcZzxeNtxvl69AW-cgAAAAAgo9c04AAAGVDl_AAAAAplhSrbcM",
          // highlight-next-line
        "id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2VtYWlsIjoibWFpbkBtYWlsLmNvbSIsInByb2ZpbGVfaW1hZ2UiOiIxNTE2MjM5MDIyIiwicHJvZmlsZV9uaWNrbmFtZSI6MTUxNjIzOTAyMn0.lpv4TzPEPUfRqqNQM_LSVbv4_tIQ03zKpKxrYm9tVZw",
        "expires_in": 21599,
        "scope": "account_email profile_image profile_nickname",
        "refresh_token_expires_in": 5183999
    }
    ```

  </TabItem>
</Tabs>

<details>
    <summary>실제 예시 이미지</summary>

    ![token_payload](./token_payload.png)
    ![token_response](./token_response.png)

</details>

### id_token을 어떻게 처리할 것인가

처음에는 `id_token`이 뭔지 몰랐고, 백엔드에서 필요하다고 하니 `access_token`과 함께 보내려고 했다. 하지만 찾아보니 JWT(JSON Web Token) 형식의 `id_token`을 디코딩하면 프론트에서도 사용자 정보를 확인할 수 있다는 것을 알게 됐다.
그렇다면 굳이 백엔드에서 처리하지 않고, 프론트에서 바로 사용자 정보를 보여줄 수 있다는 건데.
과연 이 개인 정보를 이렇게 프론트에서 관리하는 게 맞을까? 싶었다.

그렇게 더 나은 방법을 찾기 위해 카카오 로그인 문서와 구글 로그인 문서를 샅샅이 뒤지기 시작했고, OIDC(OpenID Connect)라는 것을 알게 되었다. ([kakao developers - OIDC](https://.kakao.com/docs/latest/ko/kakaologin/rest-api#oidc))

### 그럼 OIDC를 활용하자

OIDC는 OpenID Connect의 약자로 OAuth 2.0 사양 프레임워크를 기반으로 하는 상호 운용 가능한 인증 프로토콜이다. OIDC의 핵심 기능 중 하나가 `id_token`의 유효성 검증이다.

OIDC의 개념을 발견하고, 백엔드에서 `id_token`의 서명을 검증한 후, 검증된 사용자 정보만 프론트에 반환하는 방법을 떠올릴 수 있었다.
이 방법을 사용하면 프론트에서 `id_token`를 직접 다루지 않을 수 있고, 또 검증된 정보만 사용하게 되기 때문에 보안을 강화할 수 있을 것이다.

### 최종 선택

최종적으로 프론트에서 `access_token`과 `id_token`을 백엔드로 보내 검증하는 방식을 채택했다.

프론트에서 `id_token`을 저장하거나 직접 관리하지 않기 때문에 XSS 공격에 대한 위험이 줄어든다.
또, 백엔드가 카카오의 공개키로 서명을 검증해서, 변조 토큰 사용을 방지할 수 있다.
그리고 프론트는 검증된 정보만 사용하기 때문에, 사용자 정보를 안전하게 처리하게 된다.

개선된 인증 프로세스는 아래와 같다.

```mermaid
sequenceDiagram
    participant User as 사용자
    participant Frontend as 프론트엔드
    participant OAuthServer as OAuth 서버 (카카오)
    participant Backend as 백엔드

    User->>Frontend: 로그인 버튼 클릭
    Frontend->>Frontend: code_verifier 생성 및 저장
    Frontend->>Frontend: code_challenge 생성
    Frontend->>OAuthServer: 인증 요청 (code_challenge, code_challenge_method, state 포함)
    OAuthServer-->>Frontend: 인가 코드 (authorization_code, state 포함) 반환

    Frontend->>Frontend: 응답받은 state와 저장된 state 비교 (CSRF 검증)
    Frontend->>OAuthServer: 토큰 요청 (authorization_code, code_verifier 포함)
    OAuthServer-->>Frontend: access_token, id_token 반환

    Frontend->>Frontend: access_token 저장
    Frontend->>Backend: access_token 전송, id_token 검증 요청
    Backend->>OAuthServer: id_token 서명 검증
    OAuthServer-->>Backend: 검증 성공
    Backend-->>Frontend: user 데이터 반환

    Frontend->>Frontend: user 데이터 반환
    Frontend->>User: 로그인 완료 후 메인 페이지로 이동

```

<br/>

<details open>
    <summary>용어 설명</summary>

        - `code_verifier` : 최소 43 ~ 최대 128 글자 수의 Cryptographic Random String이다. [A-Z] / [a-z] / [0-9] / "-" / "." / "_" / "~" 문자들로만 구성된다.
        - `code_challenge` : SHA-256 알고리즘으로 Code Verifier를 해싱한 후 Base64로 인코딩을 한 값이다.
        - `code_challenge_method` : `code_challenge`를 해싱하는 데 사용한 메서드이다.
        - `state` : Client가 인증 요청 시 생성하여 인증 서버에 전달하는 임의의 값으로, CSRF 공격을 방지하고 인증 요청의 상태를 유지하는 역할을 한다.

        :::info `state`와 `code_challenge` 비교

        | 매개변수                           | 정의                                                            | 목적                |
        | ---------------------------------- | --------------------------------------------------------------- | ------------------- |
        | `state`                              | Client가 인증 서버에 보내는 인증 요청에 포함된 임의로 생성된 값 | CSRF 공격 방지      |
        | `code_challenge` (`code_verifier`) | `code_verifier`를 해싱하거나 변환하여 생성된 값                 | 인가 코드 탈취 방지 |

        :::

</details>

### PKCE 기반 카카오 로그인 구현하기

#### 1. Code Verifier & Code Challenge & State 생성

먼저 `code_verifier`, `code_challenge`를 생성하는 유틸 함수를 만든다.
여기에서는 CSRF 방지를 위한 `state`도 함께 생성했다.

```tsx title="/src/pages/auth/login/utils/generator.ts"
const base64Encode = (arrayBuffer: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
};

// Code Verifier 생성
const generateCodeVerifier = () => {
    const randomValues = new Uint8Array(32);
    crypto.getRandomValues(randomValues);
    return base64Encode(randomValues);
};

// Code Verifier를 SHA-256로 해싱, Code Challenge 생성
const generateCodeChallenge = async (codeVerifier: string) => {
    const codeChallengeBytes = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(codeVerifier)
    );
    return base64Encode(codeChallengeBytes);
};

// CSRF 방지를 위한 state 생성
const generateState = () => {
    const randomValues = new Uint8Array(32);
    crypto.getRandomValues(randomValues);
    return base64Encode(randomValues);
};
```

#### 2. 인가 코드 요청

카카오 로그인 페이지로 리다이렉션 하는 함수를 작성했다.

기존의 `localStorage` 저장 방식에서 `sessionStorage`로 변경해 보안을 높였다.
`sessionStorage`를 사용하면 브라우저가 종료 시 데이터가 삭제되기 때문에, 보안성을 조금 더 높일 수 있다.

```tsx title="/src/pages/auth/login/index.tsx"
const handleRedirectToKakao = async () => {
    const codeVerifier = generateCodeVerifier();
    sessionStorage.setItem("code_verifier", codeVerifier);

    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    sessionStorage.setItem("state", state);

    // highlight-next-line
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${state}`;

    window.location.href = kakaoAuthUrl;
};
```

인가 서버로 보내는 정보는 아래와 같다. Scope는 카카오 개발자 콘솔에 미리 등록했기 때문에, 여기에 작성하진 않았다.

```text title="kakaoAuthUrl"
https://kauth.kakao.com/oauth/authorize?response_type=code
    &client_id=eeerandomclientid1234sample0o0o0
    &redirect_uri=http://localhost:3000/oauth/kakao/authorize/fallback
    &code_challenge=FZDZto8eBUgrNTrKDB0CxUqFYdIfKqMcnSrbrgNNCbc
    &code_challenge_method=S256
    &state=gEfRamABWs0tIHHs
```

:::warning 트러블 슈팅 : PKCE validation failed. transformed code verifier does not match code challenge.

인가 코드 요청 과정에서 `generateCodeChallenge(codeVerifier)` 사용 시, `await`을 누락해 `code_challenge`가 올바르게 생성되지 않아 카카오 서버에서 400 오류가 발생했다.
당연하게도 `generateCodeChallenge(codeVerifier)`는 해싱하는 **비동기 함수**이기 때문에, 해싱이 완료된 다음에 값을 전달해야 한다.

```tsx title="/src/pages/auth/login/index.tsx"
const codeChallenge = await generateCodeChallenge(codeVerifier);
```

```json
{
    "error": "invalid_grant",
    "error_description": "PKCE validation failed. transformed code verifier does not match code challenge.",
    "error_code": "KOE313"
}
```

![400](./bad_request.png)

:::

:::tip 해싱(Hashing)이란?

![hash](./hash.png)

-   해싱(Hashing)은 해시 함수에 문자열 입력값을 넣어서 특정한 값으로 추출하는 것을 의미한다.
-   Plain Text → hash Function → hashed Text
    -   반대 방향으로 Plain Text로 만드는 건 안 된다.

:::

#### 3. 인가 코드 처리 - Callback 페이지

로그인 후 리다이렉션 된 페이지에서 인가 코드(`code`)와 `state`를 받는다.
`state`는 기존에 저장된 `originState`와 비교하고, `codeVerifier`도 `sessionStorage`에서 가져온다.

```tsx title='/src/pages/auth/callback/index.tsx'
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get("code");
const state = urlParams.get("state");
const originState = sessionStorage.getItem("state");
const codeVerifier = sessionStorage.getItem("code_verifier");
```

```tsx title='/src/pages/auth/callback/index.tsx'
if (!code) {
    setErrorMessage("인증 코드가 없습니다.");
    navigate("/login");
    return;
}

if (!state || state !== originState) {
    setErrorMessage("state가 없습니다.");
    navigate("/login");
    return;
}

if (!codeVerifier) {
    setErrorMessage("code_verifier가 없습니다.");
    navigate("/login");
    return;
}
```

#### 4. Access Token 요청

위 데이터를 검증한 후, 받은 인가 코드와 기존에 로그인 페이지에서 생성했던 `codeVerifier`를 토큰 서버로 보내 Access Token을 요청한다.
토큰 서버는 `code_verifier`를 `code_challenge_method`로 확인하고, 이후 `access_token`과 `id_token`을 반환한다.

```tsx title='/src/pages/auth/callback/index.tsx'
const requestToken = async () => {
    try {
        const data = {
            grant_type: "authorization_code",
            client_id: KAKAO_CLIENT_ID,
            redirect_uri: KAKAO_REDIRECT_URI,
            code,
            code_verifier: codeVerifier,
        };

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
        };

        const params = new URLSearchParams(data);

        const response = await axios.post(
            "https://kauth.kakao.com/oauth/token",
            params,
            { headers }
        );

        const { access_token, id_token } = response.data;

        if (!access_token) {
            throw new Error("토큰이 유효하지 않습니다.");
        }

        setTokens(access_token);

        mutate({ accessToken: access_token, idToken: id_token });
    } catch {
        setErrorMessage("로그인 중 오류가 발생했습니다.");
        navigate("/login");
    }
};
```

#### 5. 백엔드에서 id_token 검증

백엔드는 프론트에서 보낸 `id_token`을 OIDC로 검증하고, JWT 디코딩을 통해 필요한 유저 정보를 프론트로 보내주게 된다.

<br/>
<br/>

:::note 참고

-   [OAuth 2.0 아키텍처 이해와 보안 취약점 사례](https://www.igloo.co.kr/security-information/spring-security-part2-oauth-2-0-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%EC%9D%B4%ED%95%B4%EC%99%80-%EB%B3%B4%EC%95%88-%EC%B7%A8%EC%95%BD%EC%A0%90-%EC%82%AC%EB%A1%80)
-   [PKCE: OAuth를 더욱더 안전하게 만드는 방법](https://devocean.sk.com/blog/techBoardDetail.do?ID=166255&boardType=techBlog)
-   [Leaking authorization codes and access tokens](https://portswigger.net/web-security/oauth#leaking-authorization-codes-and-access-tokens)
-   [PKCE: What and Why? - Authorization code flow](https://dropbox.tech/developers/pkce--what-and-why-)
-   [Authorization Code Flow with PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce)
-   [PKCE Mechanism](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet#pkce-proof-key-for-code-exchange-mechanism)
-   [Best practice on Securing code_verifier in PKCE](https://stackoverflow.com/questions/67517436/best-practice-on-securing-code-verifier-in-pkce-enhanced-authorization-code-flow)
-   [FISA Seminar - PKCE](https://www.slideshare.net/slideshow/fisa-1-oauth2-0-jwt/269561947#34)
-   [OAuth 2.0 Auth Code Injection Attack in Action - Oktadev](https://www.youtube.com/watch?v=1ot45WwQWJE)
-   [간단한 OAuth 보안 재확인 - State](https://blog.logto.io/ko/oauth-security-recap)
-   [OAuth 2.0에서 PKCE의 목적과 보안 효과](https://blog.pages.kr/3183)
-   [The Back-end for Front-end Pattern (BFF)](https://philcalcado.com/2015/09/18/the_back_end_for_front_end_pattern_bff.html)
-   [OAuth 2.0 for Browser-Based Applications](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps#section-6.1)
-   [The Backend for Frontend Pattern](https://auth0.com/blog/the-backend-for-frontend-pattern-bff/)
-   [PKCE에 BFF를 적용](https://docs.abblix.com/docs/openid-connect-flows-explained-simply-from-implicit-flows-to-authorization-code-flows-with-pkce-and-bff#authorization-code-flow-with-pkce-and-bff)
-   [BFF란](https://dev-bak.tistory.com/58)
-   [해싱(Hashing)이란?](https://velog.io/@bbaekddo/cs-3)
-   [OAuth 2.0 for Mobile & Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)

:::

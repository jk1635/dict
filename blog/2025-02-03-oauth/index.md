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

### 인증과 인가의 차이

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

## 프로젝트에 적용해보기

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

구상 3. 백엔드 중심 + PKCE 적용, OAuth 2.0 Best Practice 준수

-   프론트에서 백엔드 /auth/login API 호출
-   백엔드가 카카오 OAuth 서버로 리다이렉트 (PKCE code_challenge 포함)
-   카카오 인가 서버에서 인가 코드 발급 후 백엔드로 리다이렉트
-   백엔드가 인가 코드를 이용해 카카오 OAuth 서버에 Access Token 요청 (PKCE code_verifier 포함)
-   백엔드가 Access Token과 Refresh Token을 저장 (DB 또는 Redis)
-   프론트에는 Access Token을 제공하지 않고, 세션 쿠키 또는 자체 발급 JWT 반환
-   프론트는 Access Token을 직접 다루지 않고, API 요청 시 세션 쿠키 또는 자체 발급 JWT를 사용하여 인증 유지

구상 3은 RFC의 Best Current Practice 문서([RFC 9700](https://datatracker.ietf.org/doc/rfc9700))를 참고했다.

## PKCE란 무엇인가

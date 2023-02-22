<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://s3.hyuns.dev/hyuns.jpg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <h2 align="center">react-notion-cacher-backend</h2><p align="center">
</p>

# 엔드포인트

## `POST /auth/signin`

ID/PW를 통해 accessToken을 발급합니다.

### Request

- Body Params

  | Key      | Type     | Example             | description | required |
  | -------- | -------- | ------------------- | ----------- | -------- |
  | email    | `string` | example@example.com | 이메일      | ✅       |
  | password | `string` | password            | 비밀번호    | ✅       |

### Response `200`

```json
// Example Response
{
  "accessToken": "..."
}
```

```typescript
// Type
{
  accessToken: string;
}
```

---

## `POST /auth/signup`

새로운 계정을 생성합니다.

### Request

- Body Params

  | Key        | Type     | Example             | description                    | required |
  | ---------- | -------- | ------------------- | ------------------------------ | -------- |
  | email      | `string` | example@example.com | 이메일                         | ✅       |
  | password   | `string` | password            | 비밀번호                       | ✅       |
  | adminToken | `string` | secret_asdf         | `.env` 파일의 `ADMIN_TOKEN` 값 | ✅       |

  만약 `.env` 파일에 `ADMIN_TOKEN` 의 값이 없을 경우, 계정 생성을 거부합니다.

### Response `204`

별도의 응답 데이터가 없습니다.

---

## `DELETE /auth/account`

계정을 삭제합니다.

### Request

- Headers

  | Key           | Type     | Example           | description                                            | required |
  | ------------- | -------- | ----------------- | ------------------------------------------------------ | -------- |
  | authorization | `string` | Bearer 1234567890 | `POST /auth/login` 을 통해 발급받은 유효한 accessToken | ✅       |

### Response `204`

별도의 응답 데이터가 없습니다.

---

## `GET /page`

특정 노션 페이지를 가져옵니다.

### Request

- Query Params

  | Key      | Type     | Example                          | description                                           | required |
  | -------- | -------- | -------------------------------- | ----------------------------------------------------- | -------- |
  | pageId   | `string` | 63354a1852f04587a9f4d77ad2686d53 | 페이지의 노션 아이디                                  | ❌       |
  | pageCode | `string` | main                             | 미리 등록된 페이지 코드                               | ❌       |
  | domain   | `string` | index                            | 가져오고 싶은 페이지의 영역, 값이 없으면 index로 취급 | ❌       |

  `pageId` 와 `pageCode` 가 모두 없는 경우 `400 WRONG_PARAMS` 오류를 반환합니다.

  `pageId` 와 `pageCode` 가 모두 있는 경우 `pageId` 를 우선합니다.

### Response `200`

```json
// Example Response
{
    "pageId": "63354a1852f04587a9f4d77ad2686d53",
    "pageCode": "main",
    "domain": "index",
    "cachedAt": "2023-02-17T01:08:00",
    "recordMap": { ... }
}
```

```typescript
// type
{
    pageId: string;
    pageCode: string | undefined;
    domain: string;
    cachedAt: string;
    recordMap: { ... };
}
```

---

## `GET /pages`

모든 캐싱된 노션 페이지를 한 번에 50개씩 (env의 `GET_PAGES_LIMIT` 를 변경하여 수정 가능) 가져옵니다.

`authorization` 헤더를 통한 인증이 필요합니다.

### Request

- Query Params

  | Key  | Type     | Example | description                         | required |
  | ---- | -------- | ------- | ----------------------------------- | -------- |
  | page | `number` | 1       | 조회하고 싶은 페이지 ( 1부터 시작 ) | ❌       |

- Headers

  | Key           | Type     | Example           | description                                            | required |
  | ------------- | -------- | ----------------- | ------------------------------------------------------ | -------- |
  | authorization | `string` | Bearer 1234567890 | `POST /auth/login` 을 통해 발급받은 유효한 accessToken | ✅       |

### Response `200`

```json
// Example Response
{
    "pages": [
        {
            "pageId": "63354a1852f04587a9f4d77ad2686d53",
            "pageCode": "main",
            "domain": "index",
            "cachedAt": "2023-02-17T01:08:00",
            "recordMap": { ... }
        }, {
            "pageId": "63354a1852f04587a9f4d77ad2686d53",
            "pageCode": "main",
            "domain": "index",
            "cachedAt": "2023-02-17T01:08:00",
            "recordMap": { ... }
        },
        ...
    ],
    "page": 1
}
```

```typescript
// Type
{
    pages: {
        pageId: string;
        pageCode?: string;
        domain: string;
        cachedAt: string;
        recordMap: { ... };
    }[],
    page: number
}
```

---

## `PATCH /pages/:pageId`

특정 페이지를 수정합니다.

`authorization` 헤더를 통한 인증이 필요합니다.

### Request

- Headers

  | Key           | Type     | Example           | description                                            | required |
  | ------------- | -------- | ----------------- | ------------------------------------------------------ | -------- |
  | authorization | `string` | Bearer 1234567890 | `POST /auth/login` 을 통해 발급받은 유효한 accessToken | ✅       |

- Path Params

  | Key    | Type     | Example | description                         | required |
  | ------ | -------- | ------- | ----------------------------------- | -------- |
  | pageId | `number` | 1       | 조회하고 싶은 페이지 ( 1부터 시작 ) | ❌       |

- Body Params

  ```typescript
    {
      pageCode?: string;
      domain?: string;
      reCaching?: boolean;
      lazyReCaching?: boolean;
    }
  ```

  | Key           | Type      | Example | description                                    | required |
  | ------------- | --------- | ------- | ---------------------------------------------- | -------- |
  | pageCode      | `string`  | main    |                                                | ❌       |
  | domain        | `string`  | index   |                                                | ❌       |
  | reCaching     | `boolean` | true    | 기존 캐시를 삭제하고 새로 캐싱합니다.          | ❌       |
  | lazyReCaching | `boolean` | true    | 기존 캐시를 삭제하고 다음 조회시에 캐싱합니다. | ❌       |

  `reCaching`과 `lazyReCaching` 이 모두 `true` 인 경우 `reCaching` 으로 동작합니다.

### Response `204`

별도의 응답 데이터가 없습니다.

---

## `DELETE /pages/:pageId`

캐싱된 페이지의 정보를 삭제합니다.

`authorization` 헤더를 통한 인증이 필요합니다.

### Request

- Headers

  | Key           | Type     | Example           | description                                            | required |
  | ------------- | -------- | ----------------- | ------------------------------------------------------ | -------- |
  | authorization | `string` | Bearer 1234567890 | `POST /auth/login` 을 통해 발급받은 유효한 accessToken | ✅       |

- Path Params

  | Key    | Type     | Example | description                         | required |
  | ------ | -------- | ------- | ----------------------------------- | -------- |
  | pageId | `number` | 1       | 조회하고 싶은 페이지 ( 1부터 시작 ) | ❌       |

### Response `204`

별도의 응답 데이터가 없습니다.

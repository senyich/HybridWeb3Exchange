# HybridWeb3Exchange — Гибридная децентрализованная биржа (DEX)

## Описание программы для диплома

### Назначение системы

**HybridWeb3Exchange** — это гибридная децентрализованная биржа (DEX), построенная на блокчейне Ethereum, которая объединяет преимущества автоматического маркет-мейкера (AMM) с традиционным веб-интерфейсом для обеспечения удобной и безопасной торговли криптоактивами.

Система позволяет пользователям:
- Обменивать ETH на ERC-20 токены и обратно без посредников
- Предоставлять ликвидность в торговые пулы и получать доход от комиссий
- Отслеживать рыночные данные в реальном времени
- Управлять своими активами через децентрализованный интерфейс

### Архитектура системы

Система построена по трёхуровневой архитектуре:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
│  React + TypeScript + Vite + Wagmi + ConnectKit                 │
│  (SwapPage, DashboardPage, TokenSwap, WalletConnect)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend Layer (ASP.NET)                    │
│  ASP.NET Core Web API + Entity Framework + PostgreSQL           │
│  (TokensController, MarketDataController, Background Workers)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Blockchain Layer (Ethereum)                  │
│  Solidity Smart Contracts (HybridExchangeAMM, MyToken)          │
│  (Hardhat, OpenZeppelin, Nethereum)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Компоненты системы

#### 1. Smart Contract Layer (Hardhat Service)

**HybridExchangeAMM.sol** — основной контракт биржи:
- Реализует модель AMM с формулой постоянного продукта `x * y = k`
- Комиссия за обмен: 0.3%
- Функции: `addLiquidity()`, `removeLiquidity()`, `swapExactETHForTokens()`, `swapExactTokensForETH()`
- Поддержка fee-on-transfer токенов
- Защита от reentrancy (OpenZeppelin ReentrancyGuard)
- Механизм deadline для защиты от frontrunning

**MyToken.sol** — шаблон ERC-20 токенов для создания ликвидности.

#### 2. Backend Layer (ASP.NET Service)

**Контроллеры:**
- `TokensController` — CRUD операции для токенов (добавление, получение списка)
- `MarketDataController` — получение актуальных цен ETH/USDT

**Background Workers:**
- `BlockchainWorker` — прослушивание событий блокчейна через WebSocket (Swap, LiquidityAdded)
- `MarketHelperWorker` — периодический опрос Binance API для получения цен ETH

**База данных:** PostgreSQL с миграциями Entity Framework

**Сущности:**
- `Token` (Id, Name, Symbol, Address)
- `EthTicker` (Id, TimeStamp, Price)

#### 3. Frontend Layer (React Frontend)

**Страницы:**
- `HomePage` — главная страница
- `SwapPage` — интерфейс обмена токенов
- `DashBoardPage` — панель управления с балансами и пулами ликвидности

**Компоненты:**
- `TokenSwap` — форма обмена
- `WalletConnectButton` — подключение кошелька (MetaMask)
- `EthPriceTicker` — отображение цены ETH
- `BalanceCard`, `LiquidityPoolCard`, `UserInfoCard` — информационные карточки

**Технологии:** React 18, TypeScript, TailwindCSS, Wagmi, Viem, ConnectKit

---

## Use Case Диаграмма

### Акторы системы

| Актор | Описание |
|-------|----------|
| **Trader (Трейдер)** | Пользователь, осуществляющий обмен токенов |
| **Liquidity Provider (Поставщик ликвидности)** | Пользователь, предоставляющий активы в пулы |
| **Admin (Администратор)** | Управление списком токенов, мониторинг |
| **System (Система)** | Автоматические процессы (синхронизация цен, события) |

### Use Case Diagram (PlantUML)

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Trader\n(Трейдер)" as Trader
actor "Liquidity Provider\n(Поставщик ликвидности)" as LP
actor "Admin\n(Администратор)" as Admin
actor "System\n(Система)" as System

rectangle "HybridWeb3Exchange" {
    
    usecase "Connect Wallet\n(Подключить кошелёк)" as UC1
    usecase "View Token Balances\n(Просмотр балансов)" as UC2
    usecase "Swap ETH → Token\n(Обмен ETH на токен)" as UC3
    usecase "Swap Token → ETH\n(Обмен токена на ETH)" as UC4
    usecase "View Market Price\n(Просмотр рыночной цены)" as UC5
    
    usecase "Add Liquidity\n(Добавить ликвидность)" as UC6
    usecase "Remove Liquidity\n(Вывести ликвидность)" as UC7
    usecase "View Pool Reserves\n(Просмотр резервов пула)" as UC8
    usecase "View LP Share\n(Просмотр доли в пуле)" as UC9
    
    usecase "Manage Token List\n(Управление списком токенов)" as UC10
    usecase "Monitor Transactions\n(Мониторинг транзакций)" as UC11
    
    usecase "Sync ETH Price\n(Синхронизация цены ETH)" as UC12
    usecase "Listen Blockchain Events\n(Слушание событий)" as UC13
}

Trader --> UC1
Trader --> UC2
Trader --> UC3
Trader --> UC4
Trader --> UC5
Trader --> UC6
Trader --> UC7
Trader --> UC8
Trader --> UC9

LP --> UC6
LP --> UC7
LP --> UC8
LP --> UC9

Admin --> UC10
Admin --> UC11

System --> UC12
System --> UC13

UC3 ..> UC5 : <<include>>
UC4 ..> UC5 : <<include>>
UC6 ..> UC8 : <<include>>
UC7 ..> UC9 : <<include>>
UC11 ..> UC13 : <<include>>

@enduml
```

### Текстовое описание Use Cases

#### UC1: Connect Wallet (Подключить кошелёк)
- **Актор:** Trader, LP
- **Предусловие:** Браузер с установленным MetaMask
- **Постусловие:** Кошелёк подключён, адрес доступен в приложении
- **Сценарий:**
  1. Пользователь нажимает "Connect Wallet"
  2. Frontend запрашивает подключение через Wagmi/ConnectKit
  3. MetaMask показывает запрос на подключение
  4. Пользователь подтверждает
  5. Адрес кошелька сохраняется в состоянии приложения

#### UC3: Swap ETH → Token
- **Актор:** Trader
- **Предусловие:** Кошелёк подключён, есть ETH на балансе
- **Постусловие:** Токены получены, баланс обновлён
- **Сценарий:**
  1. Пользователь выбирает токен и сумму ETH
  2. Система рассчитывает количество токенов (с учётом slippage)
  3. Пользователь подтверждает транзакцию
  4. Вызывается `swapExactETHForTokens()` в смарт-контракте
  5. Транзакция подписывается в MetaMask
  6. Событие `Swap` эмитится в блокчейн
  7. Backend фиксирует событие через WebSocket

#### UC6: Add Liquidity
- **Актор:** LP
- **Предусловие:** Кошелёк подключён, есть ETH и токены
- **Постусловие:** Ликвидность добавлена, LP-токены выпущены
- **Сценарий:**
  1. Пользователь выбирает пул и сумму ETH
  2. Система рассчитывает необходимое количество токенов
  3. Пользователь одобряет расход токенов (approve)
  4. Вызывается `addLiquidity()` с deadline
  5. Контракт блокирует ETH и токены
  6. Выпускаются LP-токены (внутренний учёт)
  7. Событие `LiquidityAdded` эмитится

#### UC12: Sync ETH Price
- **Актор:** System
- **Предусловие:** Backend запущен
- **Постусловие:** Цена ETH сохранена в БД
- **Сценарий:**
  1. `MarketHelperWorker` запускается каждые 10 секунд
  2. Запрос к Binance API: `GET /api/v3/ticker/price?symbol=ETHUSDT`
  3. Парсинг ответа
  4. Создание записи `EthTicker` в PostgreSQL
  5. Очистка старых записей (cleanup)

---

## Sequence Diagram (Диаграмма последовательности)

### Сценарий: Обмен ETH на токены (Swap ETH → Token)

```plantuml
@startuml
autonumber

participant "User\n(Трейдер)" as User
participant "Frontend\n(React)" as Frontend
participant "Backend\n(ASP.NET)" as Backend
participant "PostgreSQL" as DB
participant "MetaMask" as Wallet
participant "Blockchain\n(Ethereum)" as Blockchain

User -> Frontend: 1. Выбрать токен и сумму ETH
Frontend -> Backend: 2. GET /api/market/eth/getLatestUsdPrice
Backend -> DB: 3. SELECT latest EthTicker
DB --> Backend: 4. Return price data
Backend --> Frontend: 5. Return {price, timestamp}
Frontend -> Frontend: 6. Рассчитать output amount\n(getAmountOut)
Frontend --> User: 7. Показать预估 количество токенов

User -> Frontend: 8. Нажать "Swap"
Frontend -> Wallet: 9. Request transaction approval
Wallet -> User: 10. Show confirmation dialog
User -> Wallet: 11. Confirm transaction
Wallet -> Blockchain: 12. Call swapExactETHForTokens()\n(tokenAddr, minTokensOut, deadline)

activate Blockchain
Blockchain -> Blockchain: 13. Проверить deadline
Blockchain -> Blockchain: 14. Проверить баланс ETH
Blockchain -> Blockchain: 15. Рассчитать tokensOut\n(inputAmount * 997 * tokenReserve) / ...\n(комиссия 0.3%)
Blockchain -> Blockchain: 16. Обновить резервы:\nethReserve += msg.value\ntokenReserve -= tokensOut
Blockchain -> Frontend: 17. Transfer tokens to user
Blockchain --> Wallet: 18. Emit Swap event\n(trader, token, "ETH->Token", inputAmount, tokensOut)
deactivate Blockchain

Wallet --> Frontend: 19. Transaction confirmed\n(txHash)
Frontend --> User: 20. Show success notification

note right of Blockchain
  Событие Swap:
  - trader: address
  - token: address
  - side: string
  - inputAmount: uint256
  - outputAmount: uint256
end note

Blockchain -> Backend: 21. WebSocket: New log detected
Backend -> Backend: 22. Decode SwapEventDTO
Backend -> DB: 23. Log event to audit (optional)
Backend --> Backend: 24. Update internal state

@enduml
```

### Сценарий: Добавление ликвидности (Add Liquidity)

```plantuml
@startuml
autonumber

participant "User\n(LP)" as User
participant "Frontend" as Frontend
participant "MetaMask" as Wallet
participant "Blockchain" as Blockchain
participant "Backend" as Backend

User -> Frontend: 1. Выбрать пул и сумму ETH
Frontend -> Frontend: 2. Рассчитать tokenAmount\n(tokenAmount = ethAmount * tokenReserve / ethReserve)
Frontend --> User: 3. Показать требуемое количество токенов

User -> Frontend: 4. Нажать "Add Liquidity"
Frontend -> Wallet: 5. Request approve() for tokens
Wallet -> User: 6. Show approve confirmation
User -> Wallet: 7. Confirm
Wallet -> Blockchain: 8. Call token.approve(contract, amount)
Blockchain --> Wallet: 9. Approved

Frontend -> Wallet: 10. Request addLiquidity transaction
Wallet -> User: 11. Show transaction confirmation
User -> Wallet: 12. Confirm
Wallet -> Blockchain: 13. Call addLiquidity(token, tokenAmount, deadline)\n{value: ethAmount}

activate Blockchain
Blockchain -> Blockchain: 14. Проверить isCreated\n(создать пул если нет)
Blockchain -> Blockchain: 15. Рассчитать liquidityMinted\n(если первый: ethAmount - MINIMUM_LIQUIDITY\nесли нет: ethAmount * totalLiquidity / ethReserve)
Blockchain -> Blockchain: 16. Обновить резервы:\nethReserve += ethAmount\ntokenReserve += tokenAmount\ntotalLiquidity += liquidityMinted
Blockchain -> Blockchain: 17. Записать liquidity[token][user] += amount
Blockchain --> Wallet: 18. Emit LiquidityAdded event
deactivate Blockchain

Wallet --> Frontend: 19. Transaction confirmed
Frontend --> User: 20. Show LP tokens added\nUpdate balances

Blockchain -> Backend: 21. WebSocket: LiquidityAdded event
Backend -> Backend: 22. Decode and log event
Backend --> Backend: 23. Update analytics

@enduml
```

### Сценарий: Синхронизация цены ETH (Background Process)

```plantuml
@startuml
autonumber

participant "MarketHelperWorker" as Worker
participant "Binance API" as Binance
participant "PostgreSQL" as DB
participant "ILogger" as Logger

loop Every 10 seconds
    Worker -> Binance: 1. GET /api/v3/ticker/price?symbol=ETHUSDT
    activate Binance
    Binance --> Worker: 2. Response: {"symbol":"ETHUSDT","price":"3456.78"}
    deactivate Binance
    
    Worker -> Worker: 3. Parse price to decimal
    Worker -> DB: 4. INSERT INTO EthTickers(Id, TimeStamp, Price)\nVALUES (guid, utc_now, 3456.78)
    activate DB
    DB --> Worker: 5. OK
    deactivate DB
    
    Worker -> Logger: 6. Log: "Saved ETH ticker: 3456.78 at {time}"
    
    Worker -> DB: 7. DELETE old tickers (cleanup)
    activate DB
    DB --> Worker: 8. OK
    deactivate DB
end

@enduml
```

---

## Описание взаимодействия компонентов

### Общая схема взаимодействия

```
┌──────────────┐         HTTP/REST          ┌──────────────┐
│   Frontend   │◄──────────────────────────►│   Backend    │
│   (React)    │                            │  (ASP.NET)   │
└──────┬───────┘                            └──────┬───────┘
       │                                           │
       │ Web3 (Wagmi/Viem)                         │ WebSocket
       │                                           │ (Nethereum)
       ▼                                           ▼
┌──────────────┐         JSON-RPC          ┌──────────────┐
│   MetaMask   │◄──────────────────────────►│  Ethereum    │
│   (Wallet)   │                            │  Node (RPC)  │
└──────────────┘                            └──────┬───────┘
                                                   │
                                                   │ Smart Contract
                                                   ▼
                                          ┌──────────────┐
                                          │HybridExchange│
                                          │    AMM       │
                                          └──────────────┘
```

### Каналы связи

| Компонент A | Компонент B | Протокол | Назначение |
|-------------|-------------|----------|------------|
| Frontend | Backend | HTTP REST API | Получение списка токенов, цен ETH |
| Frontend | MetaMask | EIP-1193 (Provider) | Подписание транзакций, чтение баланса |
| Frontend | Ethereum Node | JSON-RPC (через Wagmi) | Чтение состояния контрактов |
| Backend | Ethereum Node | WebSocket (Nethereum) | Подписка на события смарт-контракта |
| Backend | PostgreSQL | TCP (Entity Framework) | Хранение токенов, исторических цен |
| Backend | Binance API | HTTPS REST | Получение актуальной цены ETH/USDT |

### API Endpoints Backend

#### Tokens API
```
GET  /api/tokens/get          — Получить все токены
GET  /api/tokens/get/{symbol} — Получить токен по символу
POST /api/tokens/add          — Добавить новый токен (требует OWNER-PRIVATE-KEY)
```

#### Market Data API
```
GET /api/market/eth/getLatestUsdPrice   — Последняя цена ETH
GET /api/market/eth/getAvgPriceChange   — Среднее изменение цены за период
```

### Структура базы данных

```sql
-- Tokens: Список поддерживаемых токенов
CREATE TABLE "Tokens" (
    "Id"       uuid PRIMARY KEY,
    "Name"     text NOT NULL,
    "Symbol"   text NOT NULL,
    "Address"  text NOT NULL  -- Ethereum address (0x...)
);

-- EthTickers: Исторические цены ETH/USDT
CREATE TABLE "EthTickers" (
    "Id"        uuid PRIMARY KEY,
    "TimeStamp" timestamp NOT NULL,
    "Price"     numeric NOT NULL
);
```

### Смарт-контракт: Основные функции

| Функция | Параметры | Возвращает | Описание |
|---------|-----------|------------|----------|
| `addLiquidity` | token, tokenAmount, deadline | liquidityMinted | Добавить ETH + токены в пул |
| `removeLiquidity` | token, liquidityAmount, deadline | ethAmount, tokenAmount | Вывести ликвидность из пула |
| `swapExactETHForTokens` | token, minTokensOut, deadline | tokensOut | Обменять ETH на токены |
| `swapExactTokensForETH` | token, tokenIn, minEthOut, deadline | ethOut | Обменять токены на ETH |
| `getReserves` | token | ethReserve, tokenReserve | Получить резервы пула |
| `getETHPriceInTokens` | token | price | Цена 1 ETH в токенах |
| `getTokenPriceInETH` | token | price | Цена 1 токена в ETH |

### События смарт-контракта (Events)

```solidity
event PoolCreated(address indexed token);
event LiquidityAdded(address indexed token, address indexed provider, 
                     uint256 ethAmount, uint256 tokenAmount, uint256 liquidityMinted);
event LiquidityRemoved(address indexed token, address indexed provider, 
                       uint256 ethAmount, uint256 tokenAmount, uint256 liquidityBurned);
event Swap(address indexed trader, address indexed token, string side, 
           uint256 inputAmount, uint256 outputAmount);
event Sync(address indexed token, uint256 ethReserve, uint256 tokenReserve);
```

### Docker Compose развёртывание

```yaml
services:
  frontend:  # React app (nginx)
    port: 80
    depends_on: backend
    
  backend:   # ASP.NET Core API
    port: 8080
    environment: PostgreSQL connection
    depends_on: db
    
  db:        # PostgreSQL 15
    port: 5432
    volumes: postgres_data
```

---

## Заключение

**HybridWeb3Exchange** представляет собой полнофункциональную децентрализованную биржу, которая сочетает в себе:

1. **Безопасность блокчейна** — все операции обмена и ликвидности выполняются через смарт-контракты Ethereum
2. **Удобство веб-интерфейса** — современный React-фронтенд с подключением через MetaMask
3. **Гибридную архитектуру** — backend для кэширования данных, аналитики и мониторинга событий
4. **AMM модель** — автоматическое ценообразование по формуле постоянного продукта с комиссией 0.3%

Система готова к развёртыванию через Docker Compose и поддерживает работу в тестовых сетях Ethereum (Goerli, Sepolia) или локальном блокчейне (Hardhat Network).

---

*Документация создана для дипломного проекта*  
*HybridWeb3Exchange © 2026*

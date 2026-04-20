# KaamKaCarpenter Demo Accounts

All demo users except admin use the same password:

- Password: `Demo@12345`
- Admin password: `Admin@12345`

## Admin

- `admin@kaamkacarpenter.com` -> `Admin@12345`

## Contractors

- `contractor01@kaamkacarpenter.com` to `contractor10@kaamkacarpenter.com`
- Plans:
  - `contractor01` to `contractor03` -> `pro`
  - `contractor04` to `contractor07` -> `standard`
  - `contractor08` to `contractor10` -> `basic`

## Carpenters

- `carpenter001@kaamkacarpenter.com` to `carpenter100@kaamkacarpenter.com`
- Plans:
  - `carpenter001` to `carpenter020` -> `pro`
  - `carpenter021` to `carpenter070` -> `standard`
  - `carpenter071` to `carpenter100` -> `basic`

## Customers

- `customer01@kaamkacarpenter.com` to `customer06@kaamkacarpenter.com`
- Plans:
  - `customer01` to `customer02` -> `pro`
  - `customer03` to `customer04` -> `standard`
  - `customer05` to `customer06` -> `basic`

## Contractor to Carpenter Mapping

- `contractor01` -> `carpenter001` to `carpenter010`
- `contractor02` -> `carpenter011` to `carpenter020`
- `contractor03` -> `carpenter021` to `carpenter030`
- `contractor04` -> `carpenter031` to `carpenter040`
- `contractor05` -> `carpenter041` to `carpenter050`
- `contractor06` -> `carpenter051` to `carpenter060`
- `contractor07` -> `carpenter061` to `carpenter070`
- `contractor08` -> `carpenter071` to `carpenter080`
- `contractor09` -> `carpenter081` to `carpenter090`
- `contractor10` -> `carpenter091` to `carpenter100`

## Seeded Relations

- Every contractor has 2 jobs
- Every contractor has 10 mapped carpenters
- Every mapped carpenter gets at least 1 offer from the mapped contractor
- First 3 carpenters in each contractor bucket also get booking/payment/attendance data
- Completed bookings have contractor and carpenter reviews

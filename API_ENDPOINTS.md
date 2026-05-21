# API Endpoints Documentation

## Аутентификация
- `POST /auth/login` - Вход в систему
- `GET /auth/me` - Получить информацию о текущем пользователе

## Пользователи (Users)
- `POST /users` - Создать нового пользователя
- `GET /users` - Получить список всех пользователей
- `GET /users/:id` - Получить пользователя по ID
- `GET /users/:id/projects` - Получить проекты пользователя
- `PATCH /users/:id` - Обновить пользователя
- `DELETE /users/:id` - Удалить пользователя

## Проекты (Projects)
- `POST /projects` - Создать новый проект
- `GET /projects` - Получить список всех проектов
- `GET /projects/:id` - Получить проект по ID
- `PATCH /projects/:id` - Обновить проект
- `DELETE /projects/:id` - Удалить проект
- `POST /projects/:id/members` - Добавить участника в проект
- `DELETE /projects/:id/members/:userId` - Удалить участника из проекта

## События (Events)
- `POST /events` - Создать новое событие
- `GET /events` - Получить список событий (с фильтрацией)
- `GET /events/stats/:projectId` - Получить статистику событий по проекту
- `GET /events/:id` - Получить событие по ID
- `DELETE /events/:id` - Удалить событие

## Отчеты (Reports)
- `POST /reports` - Создать новый отчет
- `POST /reports/generate/:projectId` - Сгенерировать отчет по проекту
- `GET /reports` - Получить список отчетов (с фильтрацией)
- `GET /reports/:id` - Получить отчет по ID
- `DELETE /reports/:id` - Удалить отчет

## Фильтрация и параметры

### События (Events)
- `?projectId=uuid` - Фильтр по ID проекта
- `?userId=uuid` - Фильтр по ID пользователя
- `?type=string` - Фильтр по типу события
- `?startDate=ISO_DATE` - Начальная дата для статистики
- `?endDate=ISO_DATE` - Конечная дата для статистики

### Отчеты (Reports)
- `?projectId=uuid` - Фильтр по ID проекта
- `?type=DAILY|WEEKLY|MONTHLY` - Фильтр по типу отчета

## Структуры данных

### Создание пользователя
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER"
}
```

### Создание проекта
```json
{
  "name": "My Project",
  "description": "Project description",
  "userId": "uuid"
}
```

### Создание события
```json
{
  "type": "page_view",
  "metadata": {
    "page": "/dashboard",
    "referrer": "google.com"
  },
  "userId": "uuid",
  "projectId": "uuid"
}
```

### Создание отчета
```json
{
  "type": "DAILY",
  "data": {
    "totalEvents": 150,
    "uniqueUsers": 25
  },
  "projectId": "uuid",
  "periodStart": "2024-01-01T00:00:00Z",
  "periodEnd": "2024-01-01T23:59:59Z"
}
```

## Роли и права доступа

### Роли пользователей
- `USER` - Обычный пользователь
- `ADMIN` - Администратор
- `EDITOR` - Редактор

### Роли в проектах
- `OWNER` - Владелец проекта
- `ADMIN` - Администратор проекта
- `MEMBER` - Участник проекта
- `VIEWER` - Просмотрщик проекта

## Примечания
- Все endpoints защищены `AuthGuard`
- Для работы с проектами требуется авторизация
- События могут быть анонимными (без userId)
- Отчеты автоматически генерируются с временными метками 
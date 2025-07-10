# GTD Task Management App

Eine moderne Aufgabenverwaltungs-App für den Browser nach dem Getting Things Done (GTD) Prinzip von David Allen.

## ✨ Features

- **🗂️ GTD-Kategorien**: Inbox, Next, Waiting, Scheduled, Someday
- **✅ Aufgaben verwalten**: Hinzufügen, Bearbeiten, Löschen, Abhaken
- **🎯 Drag & Drop**: Aufgaben zwischen Kategorien verschieben
- **📅 Kalender**: Fälligkeitsdaten mit Kalender-Widget
- **🎨 Prioritäten**: Visuell mit Farben (Hoch/Mittel/Niedrig)
- **💾 PostgreSQL**: Robuste Datenbank-Speicherung
- **🐳 Docker**: Einfache Deployment-Optionen
- **📱 Responsive**: Optimiert für Desktop und Mobile

## 🚀 Schnellstart

### Mit Docker (Empfohlen)

```bash
# Repository klonen
git clone <repository-url>
cd gtd-task-manager

# Mit Docker Compose starten
docker-compose up -d

# Die App ist verfügbar unter:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Lokale Entwicklung

#### Voraussetzungen
- Node.js (v16+)
- PostgreSQL
- npm oder yarn

#### Installation

```bash
# Alle Abhängigkeiten installieren
npm run install:all

# Umgebungsvariablen konfigurieren
cp backend/.env.example backend/.env
# Passe die Datenbank-Einstellungen in backend/.env an

# Entwicklungsserver starten
npm run dev
```

## 🗂️ GTD-Kategorien

### 📥 Inbox
Sammeln Sie hier alle neuen Aufgaben, bevor Sie sie kategorisieren.

### ⏭️ Next
Aufgaben, die als nächstes abgearbeitet werden sollen.

### ⏳ Waiting
Aufgaben, bei denen Sie auf andere Personen oder externe Faktoren warten.

### 📅 Scheduled
Fest eingeplante Aufgaben mit konkreten Terminen.

### 🔮 Someday
Aufgaben für die Zukunft, die nicht vergessen werden sollen.

## 🛠️ Technische Details

### Backend
- **Node.js** mit Express.js
- **PostgreSQL** Datenbank
- **RESTful API** für CRUD-Operationen
- **Cors** für Cross-Origin-Requests

### Frontend
- **React 18** mit Vite
- **React Beautiful DnD** für Drag & Drop
- **React DatePicker** für Kalender
- **Moderne CSS** mit CSS Grid und Flexbox

### Datenbank Schema

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL DEFAULT 'inbox',
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  completed BOOLEAN DEFAULT false,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Entwicklung

### Verfügbare Scripts

```bash
# Alle Services gleichzeitig starten
npm run dev

# Nur Backend starten
npm run backend:dev

# Nur Frontend starten
npm run frontend:dev

# Production Build
npm run build

# Alle Abhängigkeiten installieren
npm run install:all
```

### API Endpoints

- `GET /api/tasks` - Alle Aufgaben abrufen
- `GET /api/tasks?category=inbox` - Aufgaben nach Kategorie
- `POST /api/tasks` - Neue Aufgabe erstellen
- `PUT /api/tasks/:id` - Aufgabe aktualisieren
- `PUT /api/tasks/:id/position` - Position/Kategorie ändern
- `DELETE /api/tasks/:id` - Aufgabe löschen

## 🐳 Docker Deployment

### Development
```bash
docker-compose up
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📱 Responsive Design

Die App ist vollständig responsive und optimiert für:
- 📱 Mobile Geräte (320px+)
- 📲 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🎨 Customization

### Farben anpassen
Bearbeiten Sie die CSS-Variablen in `frontend/src/index.css`:

```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
}
```

### Neue Kategorien hinzufügen
1. Erweitern Sie das `GTD_CATEGORIES` Array in `App.jsx`
2. Fügen Sie entsprechende Styles hinzu
3. Passen Sie die Datenbanklogik an

## 🤝 Contributing

1. Fork das Repository
2. Erstellen Sie einen Feature Branch
3. Committen Sie Ihre Änderungen
4. Pushen Sie den Branch
5. Öffnen Sie einen Pull Request

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei für Details.

## 🙏 Danksagung

- [David Allen](https://gettingthingsdone.com/) für das GTD-System
- [React Beautiful DnD](https://github.com/atlassian/react-beautiful-dnd) für Drag & Drop
- [React DatePicker](https://github.com/Hacker0x01/react-datepicker) für Kalender-Komponente
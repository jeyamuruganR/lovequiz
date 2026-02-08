# 💕 Valentine's Day Couple Compatibility Quiz

A fun and viral web app built with Next.js and Tailwind CSS to test couple compatibility!

## 🚀 Features

- **Person 1 Quiz**: Answer 10 funny relationship questions
- **Shareable Link**: Generate a unique code for Person 2
- **Person 2 Quiz**: Answer the same questions independently
- **Chat-Style Results**: Compare answers in a WhatsApp-like UI
- **Match Percentage**: See how compatible you are!
- **Fun Messages**: 
  - 70%+ = "Perfect Couple ❤️"
  - Below 70% = "Fight Loading 💀"

## 🎯 How It Works

1. Person 1 starts the quiz at `/person1`
2. After completing, get a unique shareable link
3. Share the link with Person 2
4. Person 2 completes the quiz
5. View results together in a fun chat-style comparison!

## 💻 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Storage**: localStorage
- **Language**: TypeScript

## 🛠️ Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
app/
├── data/
│   └── questions.ts      # Quiz questions and options
├── person1/
│   └── page.tsx         # Person 1 quiz page
├── person2/
│   └── page.tsx         # Person 2 quiz page
├── result/
│   └── page.tsx         # Results comparison page
├── layout.tsx           # Root layout with gradient background
├── page.tsx            # Home page
└── globals.css         # Tailwind styles
```

## 🎨 Design Features

- Valentine gradient background (pink, red, purple)
- Smooth animations and transitions
- Mobile responsive design
- Chat bubble UI for results
- Progress bars for quiz completion

## 📱 Pages

- `/` - Home page with "Start Quiz" button
- `/person1` - Person 1 quiz interface
- `/person2?code=XXXX` - Person 2 quiz interface
- `/result?code=XXXX` - Results comparison

## 🎭 Sample Questions

The quiz includes 10 funny questions about:
- Date night preferences
- Relationship communication
- Future plans
- Love languages
- Deal breakers
- And more!

## 🔧 Build for Production

```bash
npm run build
npm start
```

## 📝 License

Feel free to use this project for fun! Perfect for Valentine's Day 2026! 💕

## 🎉 Share the Love

Made with ❤️ for couples everywhere!

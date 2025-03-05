# Wallify by Wally

This is a demo NextJS application showcasing how developers can integrate Twitter's API and Wally's API to build powerful AI applications. Wallify creates an AI chat persona based on a Twitter user's tweets and replies, demonstrating the capabilities of Wally's language model.

## About Wally API

Wally's API will be publicly available soon for developers! This project gives you a good head start on how to begin building applications with the Wally platform. When the API is released, developers will be able to create similar AI-powered applications with personalized chat experiences.

## What This Demo Shows

This application demonstrates:
- How to fetch user data from Twitter (tweets and replies)
- How to format this data for use with Wally's AI
- How to create personalized AI chat experiences based on writing styles
- Best practices for API integration and security

## Features

- Fetch tweets and replies from any Twitter user
- Create an AI chat persona that mimics the user's writing style
- Secure handling of API keys
- Analysis of user's tone, vocabulary, and writing patterns

## Development Setup

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys
4. Run the development server with `npm run dev`

## Environment Variables

For security reasons, API keys are stored as environment variables:

```
# Twitter API via RapidAPI
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=twttrapi.p.rapidapi.com

# Wally API 
WALLY_API_KEY=your_wally_api_key_here
WALLY_API_URL=https://api.meetwally.app/api/chat/completions
```

## Production Deployment

When deploying to production:

1. Set environment variables on your hosting platform (Vercel, Netlify, etc.)
2. Ensure API keys are kept secret and not committed to the repository
3. The application includes fallbacks for development but relies on proper environment variables in production

## API Integration

- **Twitter API**: This demo uses RapidAPI to access Twitter data, fetching both tweets and replies to analyze writing style
- **Wally API**: Powers the AI responses based on the analyzed writing style, creating personalized chat experiences

## Security Considerations

- API keys are accessed server-side only
- Keys are not exposed to the client
- Server-side routes in `/app/api` handle all external API requests

## Building Your Own Applications

This demo provides a foundation for developers interested in building on the Wally platform. When the public API becomes available, you can use similar patterns to create diverse AI-powered applications beyond Twitter integration. # Wallify
# Wallify

# AI Analytics Integration Guide

## Overview

The AI Analytics frontend provides a beautiful, professional interface for students to:
- Get ML-powered predictions of their success probability in courses
- Receive personalized learning resource recommendations
- Track their learning analytics with stunning visualizations

## Architecture

### Components

#### 1. **AIAnalyticsPage** (`src/pages/AIAnalyticsPage.jsx`)
Main page component featuring:
- Premium gradient hero section with AI service health indicator
- Course selection panel
- One-click AI analysis button
- Prediction results with circular progress visualization
- Personalized recommendations grid
- Error handling and loading states

#### 2. **PredictionCard** (`src/components/ai/PredictionCard.jsx`)
Displays prediction results with:
- Animated circular progress indicator (0-100%)
- Color-coded risk levels (Low/Medium/High)
- Success probability percentage
- Personalized message
- Additional insights panel

#### 3. **RecommendationCard** (`src/components/ai/RecommendationCard.jsx`)
Shows learning resource recommendations:
- Resource type badges (Video, Article, Exercise, Quiz)
- Title and description
- AI reasoning for recommendation
- Click-to-open functionality
- Hover animations

#### 4. **AILoadingState** (`src/components/ai/AILoadingState.jsx`)
Premium loading animation:
- Pulsing brain icon with gradient background
- Animated loading dots
- Customizable message

### Service Layer

#### **analyticsService** (`src/services/analyticsService.js`)
Enhanced service with:
- `predictSuccess(studentId, moduleCode)` - Get success prediction
- `getRecommendations(studentId, moduleCode)` - Get personalized recommendations
- `checkHealth()` - Check AI service status
- **Demo Mode**: Automatic fallback with sample data when AI service is unavailable
- Error handling and response validation

## API Integration

### Endpoints

The service connects to your Python AI backend through the API gateway:

```javascript
// Prediction
POST /api/ai/predict
Body: { student_id: number, module_code: string }
Response: { student_id, module_code, success_proba, risk_level, message }

// Recommendations
GET /api/ai/reco/{student_id}/{module_code}
Response: { student_id, module_code, recommendations: [...] }

// Health Check
GET /api/ai/health
Response: { status: "ok" }
```

### Configuration

Ensure your API gateway routes `/api/ai/*` requests to your Python AI service.

In `vite.config.js`, the proxy should include:
```javascript
'/api/ai': {
  target: 'http://localhost:8000', // Your AI service URL
  changeOrigin: true,
  rewrite: (path) => path.replace(/^\/api\/ai/, '')
}
```

## Features

### 1. **AI Service Health Monitoring**
- Green indicator: AI service is active
- Amber indicator: Demo mode (AI service unavailable)
- Automatic fallback to demo data

### 2. **Demo Mode**
When the AI service is unavailable, the frontend automatically provides:
- Realistic sample predictions (75-95% success probability)
- 4 sample recommendations with different resource types
- Clear indication that demo mode is active

### 3. **Error Handling**
- Network errors gracefully handled
- User-friendly error messages
- Retry functionality
- No crashes or blank screens

### 4. **Premium Design**
- Gradient backgrounds with animated elements
- Smooth transitions and micro-interactions
- Color-coded risk indicators
- Responsive grid layouts
- Glassmorphism effects

## Usage

### For Students

1. Navigate to `/ai-analytics`
2. Select a course from the dropdown
3. Click "Scanner avec l'IA" button
4. View prediction results and recommendations
5. Click on recommendation cards to access resources

### For Developers

```javascript
import { analyticsService } from '../services/analyticsService';

// Get prediction
const prediction = await analyticsService.predictSuccess(studentId, moduleCode);
// Returns: { success_proba, risk_level, message, ... }

// Get recommendations
const reco = await analyticsService.getRecommendations(studentId, moduleCode);
// Returns: { recommendations: [...] }

// Check health
const health = await analyticsService.checkHealth();
// Returns: { status: "ok" } or { status: "unavailable", mode: "demo" }
```

## Troubleshooting

### AI Service Not Connecting

**Symptom**: Amber "Mode Démo" indicator in hero section

**Solutions**:
1. Verify AI service is running: `curl http://localhost:8000/health`
2. Check API gateway proxy configuration
3. Verify CORS settings on AI service
4. Check browser console for network errors

### Predictions Not Displaying

**Symptom**: Error message or empty state

**Solutions**:
1. Ensure student is enrolled in at least one course
2. Check browser console for errors
3. Verify API response format matches expected schema
4. Try demo mode to isolate backend issues

### Recommendations Not Loading

**Symptom**: Prediction shows but no recommendations

**Solutions**:
1. Check AI service logs for errors
2. Verify `/reco` endpoint is accessible
3. Ensure response includes `recommendations` array
4. Check that recommendations have required fields

## Testing

### Manual Testing Checklist

- [ ] Page loads without errors
- [ ] Health indicator shows correct status
- [ ] Course selection works
- [ ] Analyze button triggers prediction
- [ ] Loading state displays during analysis
- [ ] Prediction card shows with correct data
- [ ] Recommendations display in grid
- [ ] Recommendation cards are clickable
- [ ] Error messages display when appropriate
- [ ] Demo mode activates when AI service is down
- [ ] Responsive design works on mobile/tablet

### With Real AI Service

1. Start your Python AI service
2. Navigate to `/ai-analytics`
3. Select a course and click analyze
4. Verify real predictions appear
5. Check recommendations are relevant

### Demo Mode Testing

1. Stop your Python AI service
2. Navigate to `/ai-analytics`
3. Verify "Mode Démo" indicator appears
4. Click analyze button
5. Verify demo predictions and recommendations appear
6. Check console for demo mode warnings

## Next Steps

### Production Deployment

1. **Configure AI Service URL**: Update proxy settings for production
2. **Enable Real Data**: Connect AI service to production database
3. **Train ML Model**: Use real student performance data
4. **Set Up Monitoring**: Track AI service health and performance
5. **Optimize Performance**: Add caching for predictions
6. **Add Analytics**: Track usage and prediction accuracy

### Future Enhancements

- Prediction history tracking
- Export predictions as PDF
- Comparison with class averages
- Trend analysis over time
- More detailed insights and explanations
- A/B testing for recommendation effectiveness

## Support

For issues or questions:
1. Check browser console for errors
2. Verify AI service is running and accessible
3. Review API response formats
4. Test with demo mode to isolate issues
5. Check CORS and proxy configurations

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './redux/AuthSlice';
import statsReducer from './redux/StatsSlice';
import weatherReducer from './redux/WeatherSlice';
import thresholdReducer from './redux/ThresholdSlice';
import precautionReducer from './redux/PrecautionSlice';
import safetyGuideReducer from './redux/SafetyGuideSlice';
import safetyCategoriesReducer from './redux/SafetyCategorySlice';
import regionReducer from './redux/RegionSlice';
import districtReducer from './redux/DistrictSlice';
import communityReducer from './redux/CommunitySlice';
import userReducer from './redux/UserSlice';
import alertReducer from './redux/AlertSlice';
import languageReducer from './redux/LanguageSlice';
import audioTranslationReducer from './redux/AudioTranslationSlice';
import adminReducer from './redux/AdminSlice';
import healthTipsReducer from './redux/HealthTipsSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        stats: statsReducer,
        weather: weatherReducer,
        thresholds: thresholdReducer,
        precautions: precautionReducer,
        safetyGuides: safetyGuideReducer,
        safetyCategories: safetyCategoriesReducer,
        regions: regionReducer,
        districts: districtReducer,
        communities: communityReducer,
        users: userReducer,
        alerts: alertReducer,
        languages: languageReducer,
        audioTranslations: audioTranslationReducer,
        admins: adminReducer,
        healthTips: healthTipsReducer
    }
})

export default store;
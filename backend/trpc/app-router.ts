import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { 
  startScrapingProcedure, 
  getScrapedPropertiesProcedure, 
  clearScrapingCacheProcedure,
  getScrapingStatusProcedure,
  getScrapingHistoryProcedure,
  scheduleScrapingProcedure,
  getAlternativeDataSourcesProcedure,
  importPropertiesFromJsonProcedure,
  exportPropertiesAsJsonProcedure,
  generateSampleDataProcedure,
  getDataSourceInfoProcedure,
  startAdvancedScrapingProcedure,
  controlAutoScrapingProcedure,
  getAdvancedScrapingInfoProcedure
} from "./routes/scraping/route";
import {
  scrapeSremDataProcedure,
  getSremAnalyticsProcedure,
  getSremPropertiesProcedure,
  getSremStatusProcedure,
  clearSremCacheProcedure
} from "./routes/scraping/srem-route";
import {
  getUserProfileProcedure,
  updateUserProfileProcedure,
  getAllUsersProcedure
} from "./routes/auth/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  scraping: createTRPCRouter({
    start: startScrapingProcedure,
    getProperties: getScrapedPropertiesProcedure,
    clearCache: clearScrapingCacheProcedure,
    getStatus: getScrapingStatusProcedure,
    getHistory: getScrapingHistoryProcedure,
    schedule: scheduleScrapingProcedure,
    getAlternatives: getAlternativeDataSourcesProcedure,
    importJson: importPropertiesFromJsonProcedure,
    exportJson: exportPropertiesAsJsonProcedure,
    generateSample: generateSampleDataProcedure,
    getDataInfo: getDataSourceInfoProcedure,
    startAdvanced: startAdvancedScrapingProcedure,
    controlAuto: controlAutoScrapingProcedure,
    getAdvancedInfo: getAdvancedScrapingInfoProcedure,
  }),
  srem: createTRPCRouter({
    scrapeData: scrapeSremDataProcedure,
    getAnalytics: getSremAnalyticsProcedure,
    getProperties: getSremPropertiesProcedure,
    getStatus: getSremStatusProcedure,
    clearCache: clearSremCacheProcedure,
  }),
  auth: createTRPCRouter({
    getUserProfile: getUserProfileProcedure,
    updateUserProfile: updateUserProfileProcedure,
    getAllUsers: getAllUsersProcedure,
  }),
});

export type AppRouter = typeof appRouter;
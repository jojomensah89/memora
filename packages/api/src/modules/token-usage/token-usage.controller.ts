import { handleError } from "../../common/errors";
import type {
  CreateTokenUsageInput,
  GetTokenUsageByChatInput,
  GetTokenUsageOverTimeInput,
  GetTokenUsageStatsInput,
} from "./token-usage.inputs";
import type { TokenUsageService } from "./token-usage.service";

export class TokenUsageController {
  constructor(private service: TokenUsageService) {}

  async trackUsage(userId: string, input: CreateTokenUsageInput) {
    try {
      return await this.service.trackTokenUsage(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async getStatistics(userId: string, input: GetTokenUsageStatsInput) {
    try {
      return await this.service.getUsageStatistics(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async getUsageOverTime(userId: string, input: GetTokenUsageOverTimeInput) {
    try {
      return await this.service.getUsageOverTime(userId, input);
    } catch (error) {
      handleError(error);
    }
  }

  async getUsageByChat(userId: string, input: GetTokenUsageByChatInput) {
    try {
      return await this.service.getUsageByChat(userId, input);
    } catch (error) {
      handleError(error);
    }
  }
}

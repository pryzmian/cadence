import { IShardClient } from "@type/IShardClient";
import { ILoggerService } from "@type/insights/ILoggerService";
import { IPlayerService } from "@type/player/IPlayerService";
import { CommandInteraction } from "eris";

export interface ISlashCommandHook {
    beforeRun?: (
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ) => Promise<boolean>;
    afterRun?: (
        logger: ILoggerService,
        shardClient: IShardClient,
        playerService: IPlayerService,
        interaction: CommandInteraction
    ) => Promise<boolean>;
}

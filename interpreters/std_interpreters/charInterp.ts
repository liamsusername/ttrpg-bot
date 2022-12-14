import { CacheType, ChatInputCommandInteraction, CommandInteractionOptionResolver } from "discord.js"
import { Connection } from "mysql"
import { Character } from "../../models/character"
import { UtilityFunctions } from "../../utility/general"
import { Bridge, Interpreter } from "../interpreter_model"

export class CharacterInterpreter extends Interpreter{
    protected userID : string

    constructor(gamedb : Connection, 
                tableNameBase : string,
                options : Omit<CommandInteractionOptionResolver<CacheType>, "getMessage" | "getFocused">,
                interaction : ChatInputCommandInteraction<CacheType>){
        super(gamedb, tableNameBase, options, interaction)
        this.userID = interaction.user.id
    }

    public async add(charName : string) : Promise<string> {
        const chrUser = this.options.getUser('chr-owner')
        const stats = UtilityFunctions.formatNullString(this.options.getString('additional-stats'))
        const chrId = chrUser == null ? this.userID : String(chrUser.id)

        let additionalStats = UtilityFunctions.parseColumns(stats)
        if(additionalStats == undefined){
            return 'Issue parsing additional columns.'
        }

        let newChar = new Character(charName, 
                                    UtilityFunctions.getEmojiID(
                                        UtilityFunctions.formatNullString(
                                            this.options.getString('emote'))),
                                    UtilityFunctions.formatNullString(this.options.getString('pronouns')),
                                    chrId,
                                    this.options.getNumber('health'),
                                    0,
                                    UtilityFunctions.formatNullString(this.options.getString('status')),
                                    additionalStats);
                                    
        if(!(await newChar.addToTable(this.gamedb, this.tableNameBase))){
            return `Error: Duplicate character **\"${charName}\"**.`
        }
        
        return `The character **\"${charName}\"** has been successfully created.`
    }

    public async remove(charName : string) : Promise<string> {
        new Character(charName).removeFromTable(this.gamedb, this.tableNameBase)    

        return `The character **\"${charName}\"** has been successfully deleted.`
    }

    public async view(charName : string, bridge : Bridge) : Promise<string> {
        const char = await bridge.getCharacter(charName)

        if(char == null){
            return `Finding character **\"${charName}\"** was unsuccessful.`
        }

        this.interaction.channel?.send(
            {embeds : [char.buildViewEmbed(this.interaction.user, this.interaction.guild)] })

        return `The character **\"${charName}\"** has been successfully viewed.`
    }

    public changeStat(charName : string) : string {
        const statName = UtilityFunctions.formatString(this.options.getString('stat-name', true))
        const statValue = UtilityFunctions.formatString(this.options.getString('stat-value', true))
        let increment = this.options.getBoolean('increment')

        increment ??= false

        if(!new Character(charName).updateStat(this.gamedb, this.tableNameBase, statName, statValue, increment)){
            return 'Issue updating stat. May be due to attempting to change name stat or incrementing a non-number.'
        }

        return `The character stat **\"${statName}\"** for **\"${charName}\"** has successfully `
                + `been ${increment ? 'incremented by' : 'changed to' } **\"${statValue}\"**.`
    }
}
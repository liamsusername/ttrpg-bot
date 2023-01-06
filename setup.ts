import { Client, Guild, Options } from "discord.js"
import { CustomSetup } from "./interpreters/custom_setup"

module SetupFunctions{
    export function commandSetup(guild: Guild | undefined, client: Client<boolean>) : void {
    
        let commands

        if(guild){
            commands = guild.commands
        } else{
            commands = client.application?.commands
        }
        
        // Create Game Command
        commands?.create({
            name: 'create-game',
            description: 'Creates game',
            options: [
                {
                    name: 'game-name',
                    description: 'Name of the TTRPG to be created.',
                    required: true,
                    type: 3
                },
                {
                    name: 'dm-name',
                    description: 'User who will be the DM of the created game. Defaults to user who set command.',
                    required: false,
                    type: 6
                },
                {
                    name: 'game-type',
                    description: 'Load Predefined TTRPG (Currently Implemented: DR).',
                    required: false,
                    type: 3
                },
                {
                    name: 'additional-stats',
                    description: 'Entered in form of "[Stat-Name-1]|[Data-Type],[Stat-Name-2],...". [Data-Type] is optional.',
                    required: false,
                    type: 3
                }
            ]
        })

        // Remove Character Command
        commands?.create({
            name: 'rmv-chr',
            description: 'Removes character from the game',
            options: [
                {
                    name: 'chr-name',
                    description: 'Name of character in game.',
                    required: true,
                    type: 3
                },
                {
                    name: 'game-name',
                    description: 'Game for which character should be removed resides. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })

        // View Character Command
        commands?.create({
            name: 'view-chr',
            description: 'View a character of a specific name.',
            options: [
                {
                    name: 'chr-name',
                    description: 'Name of character in game.',
                    required: true,
                    type: 3
                },
                {
                    name: 'game-name',
                    description: 'Game for which character should be viewed resides. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })

        // Roll Command
        commands?.create({
            name: 'roll',
            description: 'Rolls dice.',
            options: [
                {
                    name: 'query',
                    description: 'Query for dice roll. Should be in the form of [Number]d[Sides of Dice] +/- [Modifierd]',
                    required: true,
                    type: 3
                },
                {
                    name: 'identifier',
                    description: 'Replace "Result:" in roll with identifier.',
                    required: false,
                    type: 3
                }
            ]
        })

        // Change Game Command
        commands?.create({
            name: 'change-game',
            description: 'Changes active game on server.',
            options: [
                {
                    name: 'game-name',
                    description: 'Name of the new active game.',
                    required: true,
                    type: 3
                }
            ]
        })

        // Change Stats Command
        commands?.create({
            name: 'change-stat',
            description: 'Changes stat of a character.',
            options: [
                {
                    name: 'chr-name',
                    description: 'Name of character whose stat should be changed.',
                    required:true,
                    type: 3
                },
                {
                    name: 'stat-name',
                    description: 'Name of stat to be changed.',
                    required: true,
                    type: 3
                },
                {
                    name: 'stat-value',
                    description: 'Value of stat to be changed.',
                    required: true,
                    type: 3
                },
                {
                    name: 'game-name',
                    description: 'Game where character\'s stats will be changed resides. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })

        // Set DM Command
        commands?.create({
            name: 'set-dm',
            description: 'Changes active game on server.',
            options: [
                {
                    name: 'newdm-name',
                    description: 'User who will be the new DM of the specified.',
                    required: true,
                    type: 6
                },
                {
                    name: 'game-name',
                    description: 'Game for which DM will be changed. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })

        // Add Character Command
        commands?.create({
            name: 'add-chr',
            description: 'Adds a character to the game.',
            options: [
                {
                    name: 'chr-name',
                    description: 'Name of character in game.',
                    required: true,
                    type: 3
                },
                {
                    name: 'emote',
                    description: 'Emote of character to be displayed. Must be an emote on this server.',
                    required: false,
                    type: 3
                },
                {
                    name: 'pronouns',
                    description: 'Pronouns to use by bot (Separate [P1]/[P2]). Defaults to They/Them.',
                    required: false,
                    type: 3
                },
                {
                    name: 'chr-owner',
                    description: 'User who owns the character, defaults to the user who executed the command.',
                    required: false,
                    type: 6
                },
                {
                    name: 'health',
                    description: 'Numerical value for health.',
                    required: false,
                    type: 10
                },
                {
                    name: 'additional-stats',
                    description: 'Additional stats to be added. Format in "[Stat-Name-1]|[Value-1],[Stat-Name-2]|[Value-2],...".',
                    required: false,
                    type: 3
                },
                {
                    name: 'game-name',
                    description: 'Game for which character should be added. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })

        // View Summary Command
        commands?.create({
            name: 'view-summary',
            description: "View Summary of all characters in currently active game.",
            options:[
                {
                    name: 'game-name',
                    description: 'Game for which summary should be found for. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })

        // Modify Inventory Command
        commands?.create({
            name: 'modify-inv',
            description: 'Adds/Removes specific item(s) to a character\'s inventory or updates it\'s quantity.',
            options:[
                {
                    name: 'char-name',
                    description: 'Name of character whose inventory item should be added/removed.',
                    required: true,
                    type: 3
                },
                {
                    name: 'item-name',
                    description: 'Name of the item to be added/removed to the character\'s inventory.',
                    required: true,
                    type: 3
                },
                {
                    name: 'quantity',
                    description: 'Positive/Negative quantity of the item to be added/removed to the char\'s inventory. Defauls to 1.',
                    required: false,
                    type: 10
                },
                {
                    name: 'description',
                    description: 'Description of item.',
                    required: false,
                    type: 3
                },
                {
                    name: 'weight',
                    description: 'Weight of singular item.',
                    required: false,
                    type: 10
                },
                {
                    name: 'game-name',
                    description: 'Game for which the item should be added to the char\'s inventory. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })

        // View Inventory Command
        commands?.create({
            name: 'view-inv',
            description: 'View an inventory or item of a character of a specific name.',
            options: [
                {
                    name: 'char-name',
                    description: 'Name of character in game.',
                    required: true,
                    type: 3
                },
                {
                    name: 'item-name',
                    description: 'Name of the item to be viewed from the character\'s inventory.',
                    required: false,
                    type: 3
                },
                {
                    name: 'game-name',
                    description: 'Game for which character\'s inventory should be viewed resides. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })

        commands?.create({
            name: 'init',
            description: 'Starts, ends, or proceeds through initiative.',
            options: [
                {
                    name: 'action',
                    description: 'Choose \'begin\' (b), \'end\' (e), or \'next\' (n) to start/end/continue initiative respectively.',
                    required: true,
                    type: 3
                },
                {
                    name: 'roll',
                    description: 'Dice (XdY) used as default die for rolling initative using \'begin\' action. Defaults to 1d20.',
                    required: false,
                    type: 3
                }
            ]
        })

        commands?.create({
            name: 'init-add',
            description: 'Adds character to initiative.',
            options: [
                {
                    name: 'char-name',
                    description: 'Name of character to be added to initiative.',
                    required: true,
                    type: 3
                },
                {
                    name: 'emote',
                    description: 'Emote to be displayed upon your turn.',
                    required: false,
                    type: 3
                },
                {
                    name: 'hp',
                    description: 'Health of the character to be added to initiative.',
                    required: false,
                    type: 10
                },
                {
                    name: 'query',
                    description: 'Overrides default die roll. Defaults to 1d20.',
                    required: false,
                    type: 3
                }
            ]
        })
        
        commands?.create({
            name: 'init-rmv',
            description: 'Removes character from initiative.',
            options: [
                {
                    name: 'char-name',
                    description: 'Name of character to be removed from initiative.',
                    required: true,
                    type: 3
                }
            ]
        })

        CustomSetup.setup(commands)
    }
}

export{SetupFunctions}
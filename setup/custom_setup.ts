import { ApplicationCommand, ApplicationCommandManager, GuildApplicationCommandManager, GuildResolvable } from "discord.js";

module CustomSetup{
    export function setup(commands: GuildApplicationCommandManager |
    ApplicationCommandManager<ApplicationCommand<
    {guild: GuildResolvable;}>, {guild: GuildResolvable;}, null> 
    | undefined) : void {

        // DR Character Commands
        commands?.create({
            name: 'dr-character',
            description: 'Facilitates DR character management.',
            options: [
                {
                    name: 'add',
                    description: 'Adds a DR character to a DR game.',
                    type: 1,
                    options: [
                        {
                            name: 'chr-name',
                            description: 'Name of character in game.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'brains',
                            description: 'Brains stat value.',
                            required: true,
                            type: 10
                        },
                        {
                            name: 'brawn',
                            description: 'Brains stat value.',
                            required: true,
                            type: 10
                        },
                        {
                            name: 'nimble',
                            description: 'Brains stat value.',
                            required: true,
                            type: 10
                        },
                        {
                            name: 'social',
                            description: 'Brains stat value.',
                            required: true,
                            type: 10
                        },
                        {
                            name: 'intuition',
                            description: 'Brains stat value.',
                            required: true,
                            type: 10
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
                            name: 'ult-talent',
                            description: 'Character\'s ultimate talent.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'skills-list',
                            description: 'List of skills for the character, should be less than the SP Total.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which character should be added to. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'view-hd',
                    description: 'Allows player to view their hope and despair secrety.',
                    type: 1,
                    options: [
                        {
                            name: 'char-name',
                            description: 'Character whose hope/despair will be viewed.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which character\'s hope/despair will be viewed. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                }
            ]
        })

        // Relationship Commands
        commands?.create({
            name: 'dr-relationship',
            description: 'Facilitates DR relationships.',
            options: [
                {
                    name: 'view',
                    description: 'View relationship between two characters',
                    type: 1,
                    options: [
                        {
                            name: 'character-1',
                            description: 'Name of character 1.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'character-2',
                            description: 'Name of character 2.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the relationship should be viewed. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'change',
                    description: 'Change relationship between two characters',
                    type: 1,
                    options: [
                        {
                            name: 'character-1',
                            description: 'Name of character 1.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'character-2',
                            description: 'Name of character 2.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'value',
                            description: 'Value in which to set the relationship to. DOES NOT ADD/SUBTRACT FROM CURRENT ONE.',
                            required: true,
                            type: 10,
                            choices: [
                                {name: 'Close Friends (+2)', value: 2},
                                {name: 'Friends (+1)', value: 1},
                                {name: 'Acquaintances (0)', value: 0},
                                {name: 'Annoyance (-1)', value: -1},
                                {name: 'Enemy (-2)', value: -2}
                            ] 
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which relationship should be changed. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                }
            ]
        })

        // Skill Commands
        commands?.create({
            name: 'dr-skill',
            description: 'Facilitates DR relationships.',
            options: [
                {
                    name: 'add',
                    description: 'Adds skill to list of skills.',
                    type: 1,
                    options:[
                        {
                            name: 'skill-name',
                            description: 'Name of skill to be added.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'description',
                            description: 'Description of skill.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'sp-cost',
                            description: 'SP Cost of skill.',
                            required: true,
                            type: 10
                        },
                        {
                            name: 'prereqs',
                            description: 'Prerequisites for the skill. Defaults to none.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the skill will be added. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'remove',
                    description: 'Removes skill to list of skills.',
                    type: 1,
                    options:[
                        {
                            name: 'skill-name',
                            description: 'Name of skill to be removed.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the skill will be removed. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'assign',
                    description: 'Assigns skill to list to a character. Unassigns skill if already assigned.',
                    type: 1,
                    options:[
                        {
                            name: 'skill-name',
                            description: 'Name of skill to be assigned/unassigned.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'char-name',
                            description: 'Name of character to which the skill will be assigned/unassigned.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the skill will be assigned/unassigned. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'view',
                    description: 'View summary of all skills in current game or skills for a specific character.',
                    type: 1,
                    options:[
                        {
                            name: 'skill-name',
                            description: 'Name of skill to be viewed. Mutually exclusive with \'char-name\' option.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'char-name',
                            description: 'Name of character to be viewed. Mutually exclusive with \'skill-name\' option.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the skills will be viewed. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                }
            ]
        })

        // Truth Bullet Commands
        commands?.create({
            name: 'dr-tb',
            description: 'Facilitates truth bullet management.',
            options: [
                {
                    name: 'add',
                    description: 'Adds tb to list of truth bullets.',
                    type: 1,
                    options:[
                        {
                            name: 'tb-name',
                            description: 'Name of tb to be added.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'description',
                            description: 'Description of tb.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'trial',
                            description: 'Trial the tb is to be used for. Defaults to -1.',
                            required: false,
                            type: 10
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the truth bullet will be added. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'remove',
                    description: 'Removes tb to list of truth bullets.',
                    type: 1,
                    options:[
                        {
                            name: 'tb-name',
                            description: 'Name of truth bullet to be removed.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'trial',
                            description: 'Trial the tb is to be removed for. Defaults to -1.',
                            required: false,
                            type: 10
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the truth bullet will be removed. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'use',
                    description: 'Uses tb within specified trial (Sets it to active).',
                    type: 1,
                    options:[
                        {
                            name: 'tb-name',
                            description: 'Name of truth bullet to be used.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'trial',
                            description: 'Trial the tb is to be used for. Defaults to -1.',
                            required: false,
                            type: 10
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the truth bullet will be used. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'assign',
                    description: 'Assigns tb to a character. Unassigns tb if already assigned.',
                    type: 1,
                    options:[
                        {
                            name: 'tb-name',
                            description: 'Name of tb to be assigned/unassigned.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'char-name',
                            description: 'Name of character to which the tb will be assigned/unassigned.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'trial',
                            description: 'Trial for which truth bullet is present to be assigned. Defaults to finding the first tb.',
                            required: false,
                            type: 10
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the tb will be assigned/unassigned. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'view',
                    description: 'View summary of all skills in current game or skills for a specific character.',
                    type: 1,
                    options:[
                        {
                            name: 'tb-name',
                            description: 'Name of skill to be viewed. Mutually exclusive with \'char-name\' option.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'char-name',
                            description: 'Name of character to be viewed. Mutually exclusive with \'tb-name\' option.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'trial',
                            description: 'Trial for which truth bullets should be received for. Defaults to all truth bullets.',
                            required: false,
                            type: 10
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which the tbs will be viewed. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                }
            ]
        })
        
        // Trial Commands
        commands?.create({
            name: 'dr-trial',
            description: 'Facilitates class trial management.',
            options: [
                {
                    name: 'begin',
                    description: 'Begins class trial.',
                    type: 1,
                    options: [
                        {
                            name: 'blackened',
                            description: 'Name of character who is the blackened.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'victims',
                            description: 'Names of the victim(s) who are murdered. Multiple format: Victim1|Victim2|VictimN',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'add-all',
                            description: 'Adds all alive characters in the Character table to the trial. Defaults to false.',
                            required: false,
                            type: 5
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which trial will begin in. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'end',
                    description: 'Ends class trial.',
                    type: 1,
                    options: [
                        {
                            name: 'cs-char1',
                            description: 'First character doing the case summary.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'cs-char2',
                            description: 'Second character doing the case summary.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which trial will be ended in. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'add-character',
                    description: 'Adds character to trial. Will autofill if character already exists.',
                    type: 1,
                    options: [
                        {
                            name: 'char-name',
                            description: 'Name of character to be added to initiative.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'emote',
                            description: 'Emote to be displayed upon your turn. Can autofill.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'query',
                            description: 'Overrides default die roll. Defaults to 2d6 + Brains.',
                            required: false,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which character will be added to the trial. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'vote',
                    description: 'Vote for who the blackened is during a class trial.',
                    type: 1,
                    options: [
                        {
                            name: 'voter-chr',
                            description: 'Name of the character who is voting',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'vote',
                            description: 'Name of character who is being voted as the blackened.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which vote will be cast. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'hangman',
                    description: 'Initiates the Hangman\'s Gambit minigame.',
                    type: 1,
                    options: [
                        {
                            name: 'char-name',
                            description: 'Name of character whose owner will receive the scrambled word DM.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'word',
                            description: 'Word that will be scrambled.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which hangman\'s gambit will take place. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                },
                {
                    name: 'interrupt',
                    description: 'Facilitates interruptions (consent/counter/rebuttal) during a trial.',
                    type: 1,
                    options: [
                        {
                            name: 'char-name',
                            description: 'Character who is interrupting the non-stop debate.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'tb-name',
                            description: 'Name of the truth bullet used to interrupt.',
                            required: true,
                            type: 3
                        },
                        {
                            name: 'type',
                            description: 'Type of interruption (counter/consent/rebuttal).',
                            required: false,
                            type: 10,
                            choices: [
                                {name: 'Consent', value: 0},
                                {name: 'Counter', value: 1},
                                {name: 'Rebuttal', value: 2}
                            ] 
                        },
                        {
                            name: 'game-name',
                            description: 'Game for which trial will be interrupted. Defaults to currently active game.',
                            required: false,
                            type: 3
                        }
                    ]
                }
            ]
        })

        // Body Discovery Command
        commands?.create({
            name: 'dr-body-discovery',
            description: 'Facilitates discovering a body.',
            options: [
                {
                    name: 'discoverers',
                    description: 'Character(s) who discovered the body. Multiple format: Disc1|Disc2|DiscN',
                    required: true,
                    type: 3
                },
                {
                    name: 'witnesses',
                    description: 'Character(s) who witnessed the murder. Multiple format: Wit1|Wit2|WitN',
                    required: false,
                    type: 3
                },
                {
                    name: 'game-name',
                    description: 'Game for which body will be discovered. Defaults to currently active game.',
                    required: false,
                    type: 3
                }
            ]
        })
    }
}

export{CustomSetup}
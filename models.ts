import DiscordJS, { Embed, EmbedBuilder, GuildEmoji, TextBasedChannelMixin } from 'discord.js';
import mysql from 'mysql'

interface Model{

}

class Character {
    public id: number;
    public prounouns: string;
    public health: number;
    constructor(public name: string, public emote: string | null, prounouns: string | null, public owner: string, health: number | null, public dmgTaken : number, public otherStats : Array<[string, string]>) {
        this.id = -1;
        this.name = name;
        this.owner = owner;
        this.dmgTaken = dmgTaken;
        this.otherStats = otherStats

        if(prounouns === null){
            this.prounouns = 'they/them'
        } else{
            this.prounouns = prounouns;
        }

        if(health === null){
            this.health = 0;
        }else{
            this.health = health;
        }
    }

    static createTable(db : mysql.Connection, tableNameBase : string, additionalStats : Array<[string, string]>): boolean {
        let queryStr = `CREATE TABLE IF NOT EXISTS ${tableNameBase}_Characters ( 
            CHR_ID INT NOT NULL AUTO_INCREMENT,
            Name varchar(255) NOT NULL,
            Emote varchar(255),
            Pronouns varchar(255) NOT NULL,
            Owner varchar(255),
            Health SMALLINT,
            DmgTaken SMALLINT,`

            additionalStats.forEach(stat =>{
                queryStr += `${stat[0]} ${stat[1]},\n`
            })

            queryStr += 'PRIMARY KEY (CHR_ID));'
        
        db.query(queryStr, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    addToTable(db : mysql.Connection, tableBaseName : string): boolean{
        let queryStr = `INSERT INTO ${tableBaseName}_Characters (Name, Emote, Pronouns, Owner, Health, DmgTaken`
        let valuesStr = `VALUES ("${this.name}", "${this.emote}", "${this.prounouns}", "${this.owner}", ${this.health}, ${this.dmgTaken}`

        this.otherStats.forEach(stat =>{
            queryStr += `, ${stat[0]}`
            valuesStr += `, "${stat[1]}"`
        })

        queryStr += ')'
        valuesStr += ');'
        
        db.query(`${queryStr}\n${valuesStr}`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }

        })

        return true
    }

    updateStat(db : mysql.Connection, tableBaseName : string, statName : string, statValue : string): boolean{
        if(statName.toUpperCase() === 'NAME'){
            return false
        }

        db.query(`UPDATE ${tableBaseName}_Characters SET ${statName} = '${statValue}' WHERE Name = '${this.name}';`, (err, res) => {
            if(err){
                console.log(err)
                throw err
            }
        })  

        return true
    }

    static parseColumns(columns : string | null): Array<[string,string]> | undefined{
        if(columns == null || columns === 'null'){
            return []
        }
        
        let retArr = new Array<[string, string]>

        let colsArr = columns.split(',')

        colsArr.forEach(col =>{
            col = col.trim()

            let statData = col.split('|')

            if(statData.length == 1){
                statData.push('varchar(255)')
            } 

            if(statData.length != 2){
                return undefined
            }

            retArr.push([statData[0].trim().replace(/ /g, '_'), statData[1]])
        })

        return retArr
    }

    removeFromTable(db : mysql.Connection, tableBaseName : string): boolean{

        db.query(`DELETE FROM ${tableBaseName}_Characters WHERE Name='${this.name}'`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    static getCharacter(db : mysql.Connection, tableBaseName : string, char_name : string): Promise<Character | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableBaseName}_Characters WHERE Name = "${char_name}";`, (err, res) =>  {
                if(err || res.length != 1){
                    console.log(err)
                    return resolve(null)
               } 

            db.query(`SHOW COLUMNS FROM ${tableBaseName}_Characters;`, (errr, ress) =>{
                if(errr){
                    console.log(errr)
                    return resolve(null)
                } 

                let stats = new Array<[string, string]>
                let baseStats = ['CHR_ID', 'Name', 'Emote', 'Pronouns', 'Owner', 'Health', 'DmgTaken']

                ress.forEach((stat: { Field: string; Type: string; }) => {
                    if(!baseStats.includes(stat.Field)){
                        stats.push([stat.Field, String(eval(`res[0].${stat.Field}`))])
                    }
                });

                let retChr = new Character(res[0].Name, res[0].Emote, res[0].Pronouns, res[0].Owner, res[0].Health, res[0].DmgTaken, stats)
                retChr.id = res[0].CHR_ID

                return resolve(retChr)
            })
           })
        })
    }

    static getAllCharacters(db : mysql.Connection, tableBaseName : string): Promise<Array<Character> | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableBaseName}_Characters;`, (err, res) =>  {
                if(err){
                    console.log(err)
                    return resolve(null)
               } 

               let retArr = new Array<Character>

               res.forEach((char: { CHR_ID: number; Name: string; Emote: string | null; Pronouns: string | null; Owner: string; Health: number | null; DmgTaken: number; }) =>{
                let retChr = new Character(char.Name, char.Emote, char.Pronouns, char.Owner, char.Health, char.DmgTaken, [])
                retChr.id = char.CHR_ID

                retArr.push(retChr)
               })

               return resolve(retArr)
           })
        })
    }

    buildViewEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null): EmbedBuilder{

        let thumbnail = guild?.emojis.cache.get(String(this.emote))?.url
        const owner = guild?.members.cache.get(this.owner)

        if(thumbnail == undefined){
            thumbnail = String(owner?.displayAvatarURL())
        }

        let embedBuilder = new EmbedBuilder()
        .setColor(owner?.displayHexColor as DiscordJS.ColorResolvable)
        .setTitle(`**${this.name}**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setDescription(`${this.prounouns}`)
        .setThumbnail(thumbnail)
        .addFields(
            { name: '**Owner:**', value: String(owner) },
		    { name: '\u200B', value: '\u200B' },
            { name: '**Health**', value: String(this.getCurrentHealth()) , inline: true},
        )
        .setTimestamp()

        this.otherStats.forEach(stat =>{
            embedBuilder.addFields({ name: stat[0], value: stat[1], inline: true})
        })

        return embedBuilder
    }

    static buildSummaryEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null, activeGame: ActiveGame, chars : Array<Character> | null): EmbedBuilder | null{

        if(chars == null){
            return null
        }

        let embedBuilder = new EmbedBuilder()
        .setColor(0x7852A9)
        .setTitle(`**${activeGame.gameName} Summary**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setThumbnail(String(guild?.iconURL()))
        .setTimestamp()

        let descStr = `**DM:** ${guild?.members.cache.get(activeGame.DM)}\n`
        chars.forEach(char => {
            let emoteStr
            if(char.emote?.length != 2){
                let emote = guild?.emojis.cache.get(String(char.emote))
                emoteStr = emote == undefined ? '' : `<:${emote.name}:${emote.id}>`
            }else{
                emoteStr = char.emote
            }

            descStr += `\n${guild?.members.cache.get(char.owner)}: ${char.name} ${emoteStr}`
        });

        embedBuilder.setDescription(descStr)

        return embedBuilder
    }

    getCurrentHealth(): number{
        return this.health - this.dmgTaken;
    }

    getPronoun( pronounNum : number): string{
        return this.prounouns.split('/')[pronounNum]
    }
}

class DRCharacter extends Character {
    public spTotal : number;
    public spUsed : number;

    constructor(
         name: string,
         emote : string | null,
         prounouns: string | null,
         owner : string,
         public talent : string | null,
         public hope : number,
         public despair : number,
         public brains : number,
         public brawn : number,
         public nimble : number, 
         public social : number, 
         public intuition : number) {
            
            super(name, emote, prounouns, owner, brawn + 5, 0, []);

            this.talent = talent;
            this.hope = hope
            this.despair = despair;
            this.brains = brains;
            this.brawn = brawn;
            this.nimble = nimble;
            this.social = social;
            this.intuition = intuition;
            this.spTotal = 15;
            this.spUsed = 0;
    }

    static createTable(db : mysql.Connection, tableNameBase : string): boolean {
        db.query(`ALTER TABLE ${tableNameBase}_Characters 
            ADD Talent varchar(255),
            ADD Hope TINYINT NOT NULL,
            ADD Despair TINYINT NOT NULL,
            ADD Brains TINYINT NOT NULL,
            ADD Brawn TINYINT NOT NULL,
            ADD Nimble TINYINT NOT NULL,
            ADD Social TINYINT NOT NULL,
            ADD Intuition TINYINT NOT NULL,
            ADD SPTotal TINYINT NOT NULL,
            ADD SPUsed TINYINT NOT NULL`, (err, res) => {
                if(err){
                    console.log(err)
                    throw err
                }
            })

        return true
    }

    //TODO: Rewrite this method to just call it's parent's addToTable method with the additional dr columns as additional cols (Will allow for less commands)
    addToTable(db : mysql.Connection, tableBaseName : string): boolean{
       
        let talent
        if(this.talent != null){
            talent = `"${this.talent}"` 
        }else{
            talent = "null"
        }

        db.query(`INSERT INTO ${tableBaseName}_Characters (Name, Emote, Pronouns, Owner, Health, DmgTaken, Talent, Hope, Despair, Brains, Brawn, Nimble, Social, Intuition, SPTotal, SPUsed)
        VALUES ("${this.name}", "${this.emote}", "${this.prounouns}", "${this.owner}", ${this.health}, ${this.dmgTaken}, ${talent}, ${this.hope}, ${this.despair}, ${this.brains}, ${this.brawn}, ${this.nimble}, ${this.social}, ${this.intuition}, ${this.spTotal}, ${this.spUsed});`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
            this.id = res.insertId
        })

        return true
    }

    static getCharacter(db : mysql.Connection, tableBaseName : string, char_name : string): Promise<DRCharacter | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableBaseName}_Characters WHERE Name = "${char_name}";`, (err, res) =>  {
                if(err || res.length != 1){
                   return resolve(null)
               } 
               
               let retChr = new DRCharacter(res[0].Name, 
                                            res[0].Emote, 
                                            res[0].Pronouns,
                                            res[0].Owner,
                                            res[0].Talent,
                                            res[0].Hope,
                                            res[0].Despair,
                                            res[0].Brains,
                                            res[0].Brawn,
                                            res[0].Nimble,
                                            res[0].Social,
                                            res[0].Intuition
                                            )
               retChr.id = res[0].CHR_ID
               
               return resolve(retChr)
           })
        })
    }

    buildViewEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null): EmbedBuilder{

        const owner = guild?.members.cache.get(this.owner)

        return new EmbedBuilder()
        .setColor(owner?.displayHexColor as DiscordJS.ColorResolvable)
        .setTitle(`**${this.name}**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setDescription(`${this.talent == null ? '' : this.talent + '\n'}${this.prounouns}`)
        .setThumbnail(String(owner?.displayAvatarURL()))
        .addFields(
            { name: '**Owner:**', value: String(owner) },
		    { name: '\u200B', value: '\u200B' },
            { name: 'Health', value: String(this.getCurrentHealth()) , inline: true},
            { name: 'Hope', value: String(this.hope), inline: true},
            { name: 'Despair', value: String(this.despair), inline: true},
            { name: 'Brains', value: String(this.brains), inline: true },
            { name: 'Brawn', value: String(this.brawn), inline: true },
            { name: 'Nimble', value: String(this.nimble), inline: true },
            { name: 'Social', value: String(this.social), inline: true },
            { name: 'Intuition', value: String(this.intuition), inline: true },
            { name: 'SP Used', value: String(this.spUsed), inline: true }
        )
        .setTimestamp()
    }

    buildSkillEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null, skills : Array<DRSkill> | null): EmbedBuilder | null{
        
        if(skills == null){
            return null
        }

        let thumbnail = guild?.emojis.cache.get(String(this.emote))?.url
        const owner = guild?.members.cache.get(this.owner)

        if(thumbnail == undefined){
            thumbnail = String(owner?.displayAvatarURL())
        }

        let embedBuilder = new EmbedBuilder()
        .setColor(owner?.displayHexColor as DiscordJS.ColorResolvable)
        .setTitle(`**${this.name}'s Skills**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setThumbnail(thumbnail)
        .setTimestamp()

        let spUsed = 0
        let descStr = `**Skills:**\n***(Cost) - Name:*** *Prereqs*\n`
        skills.forEach(skill => {
            spUsed += skill.spCost
            descStr += `\n**(${skill.spCost}) - ${skill.name}:** ${skill.prereqs}`
        });

        descStr += `\n\n**SP Total:** ${this.spTotal}\n**SP Total:** ${spUsed} ${spUsed > this.spTotal ? '\n**THIS CHARACTER HAS EXCEEDED THEIR SP TOTAL**': ''}` //TODO: Pronoun per character

        embedBuilder.setDescription(descStr)

        return embedBuilder
    }

    buildTBEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null, tbs : Array<DRTruthBullet> | null): EmbedBuilder | null{
        
        if(tbs == null){
            return null
        }

        let thumbnail = guild?.emojis.cache.get(String(this.emote))?.url
        const owner = guild?.members.cache.get(this.owner)

        if(thumbnail == undefined){
            thumbnail = String(owner?.displayAvatarURL())
        }

        let embedBuilder = new EmbedBuilder()
        .setColor(owner?.displayHexColor as DiscordJS.ColorResolvable)
        .setTitle(`**${this.name}'s Truth Bullets**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setThumbnail(thumbnail)
        .setTimestamp()

        let ctr = 0
        let descStr = `**Truth Bullets:**\n`
        tbs.forEach(tb => {
            descStr += `\n**Trial ${tb.trial == -1 ? '?' : tb.trial}:** *${tb.name}*`
        });
        descStr += `\n\n**Total Truth Bullets:** ${tbs.length}`

        embedBuilder.setDescription(descStr)

        return embedBuilder
    }

    async generateRelations(db : mysql.Connection, tableNameBase : string): Promise<boolean>{
        let allChars = await Character.getAllCharacters(db, tableNameBase)
        let queryStr = `INSERT INTO ${tableNameBase}_Relationships (CHR_ID1, CHR_ID2, VALUE)\nVALUES `

        if(allChars == undefined){
            return false
        }

        if(allChars.length < 2){
            return true
        }

        for(let charInd = 0; charInd < allChars.length - 2; ++charInd){
            let char = allChars[charInd]

            if(this.id != char.id){
                queryStr += `(${this.id}, ${char.id}, 0),`
            }
        }

        queryStr += `(${this.id}, ${allChars[allChars.length - 2].id}, 0);`

        db.query(queryStr, (err, res) =>{
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    getAllChrSkills(db : mysql.Connection, tableBaseName : string): Promise<Array<DRSkill> | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableBaseName}_Skills as Skills JOIN ${tableBaseName}_ChrSkills as ChrSkills 
                            WHERE ChrSkills.CHR_ID = ${this.id} AND ChrSkills.SKL_ID = Skills.SKL_ID;`, (err, res) =>  {
                if(err){
                    console.log(err)
                    return resolve(null)
               } 

               let retArr = new Array<DRSkill>

               res.forEach((skill: { Name: string; Prereqs: string | null; Description: string; SPCost: number; SKL_ID: number; }) =>{
                let retSkill = new DRSkill(skill.Name, skill.Prereqs, skill.Description, skill.SPCost)
                retSkill.id = skill.SKL_ID

                retArr.push(retSkill)
               })

               return resolve(retArr)
           })
        })
    }

    getAllChrTBs(db : mysql.Connection, tableBaseName : string, trial : number | null): Promise<Array<DRTruthBullet> | null>{
        return new Promise((resolve) =>{
            let trialStr = ''
            if(trial != null){
                trialStr = `AND TBs.Trial = "${trial}"`
            }
            db.query(`SELECT * FROM ${tableBaseName}_TruthBullets as TBs JOIN ${tableBaseName}_ChrTBs as ChrTBs 
                            WHERE ChrTBs.CHR_ID = ${this.id} AND ChrTBs.TB_ID = TBs.TB_ID ${trialStr};`, (err, res) =>  {
                if(err){
                    console.log(err)
                    return resolve(null)
                } 

               let retArr = new Array<DRTruthBullet>

               res.forEach((tb: { Name: string; Description: string; Trial: number | null; isUsed: boolean; TB_ID: number; }) =>{
                let retTB = new DRTruthBullet(tb.Name, tb.Description, tb.Trial, tb.isUsed)
                retTB.id = tb.TB_ID

                retArr.push(retTB)
               })

               return resolve(retArr)
           })
        })
    }

    removeFromTable(db : mysql.Connection, tableBaseName : string): boolean{

        db.query(`DELETE FROM ${tableBaseName}_Relationships WHERE (CHR_ID1 = ${this.id} OR CHR_ID2 = ${this.id});`, (err, res) =>{
            if(err){
                console.log(err)
                throw err
            }
        })

        return super.removeFromTable(db, tableBaseName)
    }
}

class DRRelationship {
    public value: number

    constructor(
        public char1 : DRCharacter,
        public char2 : DRCharacter){
        
        this.char1 = char1;
        this.char2 = char2;
        this.value = 0;
    }

    changeRelationship(db : mysql.Connection, tableNameBase : string, newValue : number): boolean{
        db.query(`UPDATE ${tableNameBase}_Relationships SET Value = ${newValue} WHERE (CHR_ID1 = ${this.char1.id} and CHR_ID2 = ${this.char2.id}) OR (CHR_ID1 = ${this.char2.id} and CHR_ID2 = ${this.char1.id});`, (err, res) =>{
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    getRelationship(db : mysql.Connection, tableNameBase : string): Promise<DRRelationship | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableNameBase}_Relationships WHERE (CHR_ID1 = ${this.char1.id} and CHR_ID2 = ${this.char2.id}) OR (CHR_ID1 = ${this.char2.id} and CHR_ID2 = ${this.char1.id});`, (err, res) =>  {
                if(err || res.length != 1){
                    console.log(err)
                   return resolve(null)
               } 
               
               this.value = res[0].Value
               
               return resolve(this)
           })
        })
    }

    static createTable(db : mysql.Connection, tableNameBase : string): boolean {
        db.query(`CREATE TABLE IF NOT EXISTS ${tableNameBase}_Relationships ( 
            CHR_ID1 INT NOT NULL,
            CHR_ID2 INT NOT NULL,
            Value INT NOT NULL,
            PRIMARY KEY (CHR_ID1, CHR_ID2),
            FOREIGN KEY (CHR_ID1) REFERENCES ${tableNameBase}_Characters(CHR_ID),
            FOREIGN KEY (CHR_ID2) REFERENCES ${tableNameBase}_Characters(CHR_ID));`, (err, res) => {
                if(err){
                    console.log(err)
                    throw err
                }
            })

        return true
    }

    buildViewEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null): EmbedBuilder{

        const owner1 = guild?.members.cache.get(this.char1.owner)
        const owner2 = guild?.members.cache.get(this.char2.owner)
        return new EmbedBuilder()
        .setColor(0x7852A9)
        .setTitle(`**${this.char1.name} X ${this.char2.name}**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setThumbnail(String(guild?.iconURL()))
        .addFields(
            {name: this.char1.name, value: `${this.char1.prounouns}\n${owner1}`, inline: true},
            {name: '💖', value: `**${this.value}**`, inline: true},
            {name: this.char2.name, value: `${this.char2.prounouns}\n${owner2}`, inline: true}
        )
        .setTimestamp()
    }
}

class DRSkill{
    public id: number;
    public prereqs : string
    constructor(public name : string, prereqs : string | null, public desc : string, public spCost : number){
        this.id = -1;
        this.name = name;
        this.desc = desc;
        this.spCost = spCost;

        if(prereqs == null){
            this.prereqs = 'None'
        }else{
            this.prereqs = prereqs;
        }
    }

    static createTables(db : mysql.Connection, tableNameBase : string): boolean {
        db.query(`CREATE TABLE IF NOT EXISTS ${tableNameBase}_Skills ( 
            SKL_ID INT NOT NULL AUTO_INCREMENT,
            Name varchar(255) NOT NULL,
            Prereqs varchar(255),
            Description varchar(1000),
            SPCost SMALLINT,
            PRIMARY KEY (SKL_ID));`, (err, res) => {
                if(err){
                    console.log(err)
                    throw err
                }
            })

        DRChrSkills.createTables(db, tableNameBase)

        return true
    }

    static getSkill(db : mysql.Connection, tableBaseName : string, skill_name : string): Promise<DRSkill | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableBaseName}_Skills WHERE Name = "${skill_name}";`, (err, res) =>  {
                if(err || res.length != 1){
                   return resolve(null)
               } 
               
               let retSkill = new DRSkill(res[0].Name,
                                            res[0].Prereqs,
                                            res[0].Description,
                                            res[0].SPCost)
               retSkill.id = res[0].SKL_ID
               
               return resolve(retSkill)
           })
        })
    }

    static getAllSkills(db : mysql.Connection, tableBaseName : string): Promise<Array<DRSkill> | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableBaseName}_Skills;`, (err, res) =>  {
                if(err){
                    console.log(err)
                    return resolve(null)
               } 

               let retArr = new Array<DRSkill>

               res.forEach((skill: { Name: string; Prereqs: string | null; Description: string; SPCost: number; SKL_ID: number; }) =>{
                let retSkill = new DRSkill(skill.Name, skill.Prereqs, skill.Description, skill.SPCost)
                retSkill.id = skill.SKL_ID

                retArr.push(retSkill)
               })

               return resolve(retArr)
           })
        })
    }

    buildViewEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null, activeGame : ActiveGame): EmbedBuilder{
        
        return new EmbedBuilder()
        .setColor(0x7852A9)
        .setTitle(`**${this.name} (ID: ${this.id}) Summary**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setDescription(`**DM:** ${guild?.members.cache.get(activeGame.DM)}\n
                        **Prerequisites:** ${this.prereqs}\n
                        **SP Cost:** ${this.spCost}\n
                        **Description:** ${this.desc}`)
        .setThumbnail(String(guild?.iconURL()))
        .setTimestamp()
    }

    static buildSummaryEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null, activeGame : ActiveGame, skills : Array<DRSkill> | null): EmbedBuilder | null{
        if(skills == null){
            return null
        }

        let embedBuilder = new EmbedBuilder()
        .setColor(0x7852A9)
        .setTitle(`**${activeGame.gameName} Skill Summary**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setThumbnail(String(guild?.iconURL()))
        .setTimestamp()

        let descStr = `**DM:** ${guild?.members.cache.get(activeGame.DM)}\n***(Cost) - Name:*** *Prereqs*\n`
        skills.forEach(skill => {
            descStr += `\n**(${skill.spCost}) - ${skill.name}:** ${skill.prereqs}`
        });

        embedBuilder.setDescription(descStr)

        return embedBuilder
    }

    addToTable(db : mysql.Connection, tableBaseName : string): boolean {

        db.query(`INSERT INTO ${tableBaseName}_Skills (Name, Prereqs, Description, SPCost)
        VALUES ("${this.name}", "${this.prereqs}", "${this.desc}", "${this.spCost}");`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }

            this.id = res.insertId
        })

        return true
    }

    removeFromTable(db : mysql.Connection, tableBaseName : string): boolean{

        db.query(`DELETE FROM ${tableBaseName}_Skills WHERE Name = '${this.name}';`, (err, res) =>{
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }
}

class DRChrSkills{
    
    constructor(public chrId : number, public sklId : number){
        this.chrId = chrId;
        this.sklId = sklId;
    }

    static createTables(db : mysql.Connection, tableNameBase : string): boolean {
        
        db.query(`CREATE TABLE IF NOT EXISTS ${tableNameBase}_ChrSkills (
            CHR_ID INT NOT NULL,
            SKL_ID INT NOT NULL,
            FOREIGN KEY (CHR_ID) REFERENCES ${tableNameBase}_Characters(CHR_ID) ON DELETE CASCADE,
            FOREIGN KEY (SKL_ID) REFERENCES ${tableNameBase}_Skills(SKL_ID) ON DELETE CASCADE);`, (err, res) => {
                if(err){
                    console.log(err)
                    throw err
                }
            })

        return true
    }

    addToTable(db : mysql.Connection, tableBaseName : string): boolean {

        db.query(`INSERT INTO ${tableBaseName}_ChrSkills (CHR_ID, SKL_ID)
        VALUES ("${this.chrId}", "${this.sklId}");`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    removeFromTable(db : mysql.Connection, tableBaseName : string): boolean {

        db.query(`DELETE FROM ${tableBaseName}_ChrSkills WHERE CHR_ID = '${this.chrId}' AND SKL_ID = '${this.sklId}';`, (err, res) =>{
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    //TODO: See if you can make a SQL query in future that can delete if exists and add if doesn't
    ifExists(db : mysql.Connection, tableBaseName : string): Promise<boolean | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableBaseName}_ChrSkills WHERE CHR_ID = '${this.chrId}' AND SKL_ID = '${this.sklId}';`, (err, res) =>  {
              if(err || res.length > 1){
                   return resolve(null)
               } 
               
               return resolve(res.length == 1)
           })
        })
    }
}

class DRTruthBullet{
    public id: number;
    public trial : number;
    constructor(public name : string, public desc : string, trial : number | null, public isUsed : boolean){
        this.id = -1;
        this.name = name;
        this.desc = desc;
        this.isUsed = isUsed;

        if(trial == null){
            this.trial = -1;
        }else{
            this.trial = trial;
        }
    }

    static createTables(db : mysql.Connection, tableNameBase : string): boolean {
        db.query(`CREATE TABLE IF NOT EXISTS ${tableNameBase}_TruthBullets ( 
            TB_ID INT NOT NULL AUTO_INCREMENT,
            Name varchar(255) NOT NULL,
            Description varchar(1000),
            Trial INT,
            isUsed BOOLEAN,
            PRIMARY KEY (TB_ID));`, (err, res) => {
                if(err){
                    console.log(err)
                    throw err
                }
            })

        DRChrTBs.createTables(db, tableNameBase)

        return true
    }

    static getTB(db : mysql.Connection, tableBaseName : string, tb_name : string, trial : number | null): Promise<DRTruthBullet | null>{
        return new Promise((resolve) =>{
            let trialStr = ''
            if(trial != null){
                trialStr = `AND Trial = "${trial}"`
            }

            db.query(`SELECT * FROM ${tableBaseName}_TruthBullets WHERE Name = "${tb_name}" ${trialStr};`, (err, res) =>  {
                if(err){
                   return resolve(null)
               } 
               
               let retTB = new DRTruthBullet(res[0].Name,
                                            res[0].Description,
                                            res[0].Trial,
                                            res[0].isUsed)
               retTB.id = res[0].TB_ID
               
               return resolve(retTB)
           })
        })
    }

    static getAllTBs(db : mysql.Connection, tableBaseName : string, trial : number | null, ): Promise<Array<DRTruthBullet> | null>{
        return new Promise((resolve) =>{
            let trialStr = ''
            if(trial != null){
                trialStr = `WHERE Trial = "${trial}"`
            }

            db.query(`SELECT * FROM ${tableBaseName}_TruthBullets ${trialStr};`, (err, res) =>  {
                if(err){
                    console.log(err)
                    return resolve(null)
               } 

               let retArr = new Array<DRTruthBullet>

               res.forEach((tb: { Name: string; Description: string; Trial: number | null; isUsed: boolean; TB_ID: number; }) =>{
                let retTB = new DRTruthBullet(tb.Name, tb.Description, tb.Trial, tb.isUsed)
                retTB.id = tb.TB_ID

                retArr.push(retTB)
               })

               return resolve(retArr)
           })
        })
    }

    buildViewEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null, activeGame : ActiveGame): EmbedBuilder{
        
        return new EmbedBuilder()
        .setColor(0x7852A9)
        .setTitle(`**${this.name} (ID: ${this.id}) Summary**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setDescription(`**DM:** ${guild?.members.cache.get(activeGame.DM)}\n
                        **Trial:** ${this.trial == -1 ? '?': this.trial}\n
                        **Description:** ${this.desc}`)
        .setThumbnail(String(guild?.iconURL()))
        .setTimestamp()
    }

    static buildSummaryEmbed(user : DiscordJS.User, guild : DiscordJS.Guild | null, activeGame : ActiveGame, tbs : Array<DRTruthBullet> | null): EmbedBuilder | null{
        if(tbs == null){
            return null
        }

        let isDM = user.id === activeGame.DM

        let embedBuilder = new EmbedBuilder()
        .setColor(0x7852A9)
        .setTitle(`**${activeGame.gameName} Truth Bullet Summary ${isDM ? '(DM View)': '(Used View)'}**`)
        .setAuthor({ name: `${user.username}`, iconURL: String(user.displayAvatarURL()) })
        .setThumbnail(String(guild?.iconURL()))
        .setTimestamp()

        let ctr = 0
        let descStr = `**DM:** ${guild?.members.cache.get(activeGame.DM)}\n\n**Truth Bullets:**\n`
        if(isDM){
            tbs.forEach(tb => {
                    descStr += `**Trial ${tb.trial == -1 ? '?': tb.trial}:** *${tb.name} (Used: ${tb.isUsed ? 'Yes' : 'No'})* \n`
            });
            ctr = tbs.length
        }else{
            tbs.forEach(tb => {
                if(tb.isUsed){
                    ctr++
                    descStr += `**Trial ${tb.trial == -1 ? '?': tb.trial}:** *${tb.name}*\n`
                }
            });
        }
        descStr += `\n\n**Total Truth Bullets:** ${ctr}`

        embedBuilder.setDescription(descStr)

        return embedBuilder
    }

    addToTable(db : mysql.Connection, tableBaseName : string): boolean {

        db.query(`INSERT INTO ${tableBaseName}_TruthBullets (Name, Description, Trial, isUsed)
        VALUES ("${this.name}", "${this.desc}", "${this.trial}", ${this.isUsed});`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }

            this.id = res.insertId
        })

        return true
    }

    removeFromTable(db : mysql.Connection, tableBaseName : string): boolean{

        let trialStr = ''
        if(this.trial != null){
            trialStr = `AND Trial = "${this.trial}"`
        }

        db.query(`DELETE FROM ${tableBaseName}_TruthBullets WHERE Name = '${this.name}' ${trialStr};`, (err, res) =>{
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    useTB(db : mysql.Connection, tableBaseName : string): boolean{
        let trialStr = ''
        if(this.trial != null){
            trialStr = `WHERE Trial = "${this.trial}"`
        }
        
        db.query(`UPDATE ${tableBaseName}_TruthBullets SET isUsed = NOT isUsed WHERE Name = "${this.name}" ${trialStr};`, (err, res) => {
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }
}

class DRChrTBs{
    
    constructor(public chrId : number, public tbId : number){
        this.chrId = chrId;
        this.tbId = tbId;
    }

    static createTables(db : mysql.Connection, tableNameBase : string): boolean {
        
        db.query(`CREATE TABLE IF NOT EXISTS ${tableNameBase}_ChrTBs (
            CHR_ID INT NOT NULL,
            TB_ID INT NOT NULL,
            FOREIGN KEY (CHR_ID) REFERENCES ${tableNameBase}_Characters(CHR_ID) ON DELETE CASCADE,
            FOREIGN KEY (TB_ID) REFERENCES ${tableNameBase}_TruthBullets(TB_ID) ON DELETE CASCADE);`, (err, res) => {
                if(err){
                    console.log(err)
                    throw err
                }
            })

        return true
    }

    addToTable(db : mysql.Connection, tableBaseName : string): boolean {

        db.query(`INSERT INTO ${tableBaseName}_ChrTBs (CHR_ID, TB_ID)
        VALUES ("${this.chrId}", "${this.tbId}");`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    removeFromTable(db : mysql.Connection, tableBaseName : string): boolean {

        db.query(`DELETE FROM ${tableBaseName}_ChrTBs WHERE CHR_ID = '${this.chrId}' AND TB_ID = '${this.tbId}';`, (err, res) =>{
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    //TODO: See if you can make a SQL query in future that can delete if exists and add if doesn't
    ifExists(db : mysql.Connection, tableBaseName : string): Promise<boolean | null>{
        return new Promise((resolve) =>{
            db.query(`SELECT * FROM ${tableBaseName}_ChrTBs WHERE CHR_ID = '${this.chrId}' AND TB_ID = '${this.tbId}';`, (err, res) =>  {
              if(err || res.length > 1){
                   return resolve(null)
               } 
               
               return resolve(res.length == 1)
           })
        })
    }
}

class ActiveGame{


    constructor(public serverID : string | null, public gameName : string | undefined, public gameType : string | null, public DM : string, public isActive : boolean){
        this.serverID = serverID;
        this.gameName = gameName;
        this.gameType = gameType;
        this.DM = DM;
        this.isActive = isActive;
    }

    static createTable(db : mysql.Connection, dbName : string): boolean {

        db.query(`CREATE TABLE IF NOT EXISTS ${dbName}.ActiveGames ( 
            SERV_ID varchar(255) NOT NULL,
            GameName varchar(255) NOT NULL,
            GameType varchar(255),
            DM varchar(255) NOT NULL,
            isActive BOOLEAN,
            PRIMARY KEY (SERV_ID, GameName));`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
        })

        return true
    }

    private inactivizeGames(db : mysql.Connection, dbName : string): void{
        db.query(`UPDATE ${dbName}.ActiveGames SET isActive = 0 WHERE isActive = 1 and SERV_ID = ${this.serverID};`, (err, res) => {
            if(err){
                console.log(err)
                throw err
            }
        })  
    }

    addToTable(db : mysql.Connection, dbName : string): boolean{

        //Sets currently active game(s) to inactive
        this.inactivizeGames(db, dbName)

        //Inserts new game to the game table, set as the active game
        db.query(`INSERT INTO ${dbName}.ActiveGames (SERV_ID, GameName, GameType, DM, isActive)
        VALUES (${this.serverID}, "${this.gameName}", "${this.gameType}", ${this.DM}, ${this.isActive});`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
            
        })

        return true
    }

    setDM(db : mysql.Connection, dbName : string): boolean{

        db.query(`UPDATE ${dbName}.ActiveGames SET DM = '${this.DM}' WHERE GameName = '${this.gameName}' and SERV_ID = ${this.serverID};`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
            
        })

        return true
    }

    changeGame(db : mysql.Connection, dbName : string): boolean{

        this.inactivizeGames(db, dbName)

        db.query(`UPDATE ${dbName}.ActiveGames SET isActive = 1 WHERE GameName = '${this.gameName}' and SERV_ID = ${this.serverID};`, (err, res) =>  {
            if(err){
                console.log(err)
                throw err
            }
            
        })

        return true
    }

    static getCurrentGame(db : mysql.Connection, dbName : string, serverID : string | null, gameName : string | undefined) : Promise<ActiveGame | null>{
        return new Promise((resolve) =>{
            let queryParam

            if(gameName == undefined){
                queryParam = 'isActive = 1'
            }else{
                queryParam = `GameName = '${gameName}'`
            }

            db.query(`SELECT * FROM ${dbName}.ActiveGames WHERE ${queryParam} AND SERV_ID = '${serverID}';`, (err, res) =>  {
                if(err || res.length != 1){
                   return resolve(null)
               } 
               
               return resolve(new ActiveGame(res[0].SERV_ID, res[0].GameName, res[0].GameType, res[0].DM, res[0].isActive))
           })
        })
    }

}

export { Character, DRCharacter, DRRelationship, DRSkill, DRChrSkills, DRTruthBullet, DRChrTBs, ActiveGame}
require('dotenv-extended').load();

const builder = require('botbuilder');
const restify = require('restify');
const Recipes = require('./recipes');
const spellService = require('./spell-service');

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
// Create connector and listen for messages
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

const inMemoryStorage = new builder.MemoryBotStorage();

const bot = new builder.UniversalBot(connector, function (session) {
    session.send('Oh beans...I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
}).set('storage', inMemoryStorage); // Register in memory storage

const recognizer = new builder.LuisRecognizer(process.env.LUIS_MODEL_URL);
bot.recognizer(recognizer);

bot.dialog('FetchCoffeeRecipe', [
    function (session, args, next) {
        session.send('Welcome to the Coffee Bot! 1 sec as we percolate on your message: \'%s\'', session.message.text);

        // try extracting entities
        const brewMethodEntity = builder.EntityRecognizer.findEntity(args.intent.entities, 'BrewMethod');
        if (brewMethodEntity) {
            // brew method entity detected, continue to next step
            session.dialogData.searchType = 'brewMethod';
            next({ response: brewMethodEntity.entity });
        } else {
            // no entities detected, ask user for which brew method they would like
            builder.Prompts.text(session, 'Which brew method are you interested in?');
        }
    },
    function (session, results) {
        const brewMethod = results.response;

        const message = 'Looking for the %s brew method';

        session.send(message, brewMethod);

        // Async search
        Recipes
            .searchBrewMethods(brewMethod)
            .then(function (method) {
                session.send('I found your brew method! %s', method.name);

                const message = new builder.Message(session)
                    .attachmentLayout(builder.AttachmentLayout.carousel)
                    .attachments([methodAsAttachment(method)]);

                session.send(message);

                // End
                session.endDialog();
            });
    }
]).triggerAction({
    matches: 'FetchCoffeeRecipe',
    onInterrupted: function (session) {
        session.send('Which brew method?');
    }
});

bot.dialog('Help', function (session) {
    session.endDialog('Hi! Try asking me things like \'how do I make a pour over\', \'how do I make a french press\' or \'how do I make espresso\'');
}).triggerAction({
    matches: 'Help'
});

// Spell Check
if (process.env.IS_SPELL_CORRECTION_ENABLED === 'true') {
    bot.use({
        botbuilder: function (session, next) {
            spellService
                .getCorrectedText(session.message.text)
                .then(function (text) {
                    console.log('Text corrected to "' + text + '"');
                    session.message.text = text;
                    next();
                })
                .catch(function (error) {
                    console.error(error);
                    next();
                });
        }
    });
}

// Helpers
function methodAsAttachment(brewMethod) {
    return new builder.HeroCard()
        .title(brewMethod.name)
        .subtitle('Difficulty: %d beans. Total time: %d minutes.', brewMethod.difficulty, brewMethod.totalTime)
        .text(brewMethod.recipe)
        .images([new builder.CardImage().url(brewMethod.image)])
        .buttons([
            new builder.CardAction()
                .title('More details')
                .type('openUrl')
                .value('https://www.bing.com/search?q=' + encodeURIComponent(brewMethod.name))
        ]);
}

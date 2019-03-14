const Promise = require('bluebird');

module.exports = {
    searchBrewMethods: function (brewMethod) {
        return new Promise(function (resolve) {
            const brewMethods = [{
                    name: 'Pour Over',
                    difficulty: '3',
                    totalTime: '3',
                    recipe: "Start with 200 degree water...",
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=PourOver&w=500&h=260',
                },
                {
                    name: 'French Press',
                    difficulty: '2',
                    totalTime: '4',
                    recipe: "Add water just off the boil to your press...",
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=FrenchPress&w=500&h=260',
                },
                {
                    name: 'Espresso',
                    difficulty: '5',
                    totalTime: '2',
                    recipe: "The most important item for espresso is the grinder...",
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=Espresso&w=500&h=260',
                }
            ];

            const brewMethodResult = brewMethods.find(method => method.name.toUpperCase() === brewMethod.toUpperCase());

            // simulate async response
            setTimeout(function () { resolve(brewMethodResult); }, 1000);
        });
    },
};

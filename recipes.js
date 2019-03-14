var Promise = require('bluebird');

module.exports = {
    searchBrewMethods: function (brewMethod) {
        return new Promise(function (resolve) {

            const brewMethods = [{
                    name: 'Pour Over',
                    difficulty: '3',
                    totalTime: '3',
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=PourOver&w=500&h=260',
                },
                {
                    name: 'French Press',
                    difficulty: '2',
                    totalTime: '4',
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=FrenchPress&w=500&h=260',
                },
                {
                    name: 'Espresso',
                    difficulty: '5',
                    totalTime: '.5',
                    image: 'https://placeholdit.imgix.net/~text?txtsize=35&txt=Espresso&w=500&h=260',
                }
            ];

            const brewMethod = brewMethods.find(method => method.name === brewMethod);

            // simulate async response
            setTimeout(function () { resolve(brewMethod); }, 1000);
        });
    },
};

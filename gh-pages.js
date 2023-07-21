var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/bexedmondson/meetingpoint.git',
        user: {
            name: 'Bex Edmondson',
            email: 'bexedmondson@gmail.com'
        }
    },
    () => {
        console.log('Deploy complete!')
    }
)
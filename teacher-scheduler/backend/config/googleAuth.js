const googleConfig = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirect: process.env.GOOGLE_REDIRECT_URL || 'http://localhost:5000/api/auth/google/callback',
    hostedDomain: 'univ-constantine2.dz'
};

module.exports = googleConfig; 
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'mongoose',
      settings: {
        uri: env('DATABASE_URI', 'mongodb+srv://mahabk:1234@ac-dfnhrgy.fq6anrr.mongodb.net/mydatabase'),
        host: env('DATABASE_HOST', 'cluster.fq6anrr.mongodb.net'),
        srv: env.bool('DATABASE_SRV', true),
        port: env.int('DATABASE_PORT', 27017),
        database: env('DATABASE_NAME', 'Strapi'),
        username: env('DATABASE_USERNAME', 'mahabk'),
        password: env('DATABASE_PASSWORD', '1234'),
      },
      options: {
        authenticationDatabase: env('AUTHENTICATION_DATABASE', null),
        ssl: env.bool('DATABASE_SSL', true),
      },
    },
  },
});

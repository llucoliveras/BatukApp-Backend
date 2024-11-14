const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "BatukApp API",
            version: "1.0.0",
            description: "Documentation for BatukApp API"
        },
        components: {
            schemas: {
                User: {
                    $ref: './classes/User.json'
                }
            }
        },
        servers: [
            {
                url: "http://localhost:4000",
                description: "Backend server"
            }
        ]
    },
    apis: ["./routes/*.js"]
};

const specs = swaggerJSDoc(options);

module.exports = function(app) {
  app.use("/swagger", swaggerUi.serve, swaggerUi.setup(specs));
};

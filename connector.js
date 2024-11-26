(function() {
    // Create the connector object
    var myConnector = tableau.makeConnector();

    // Define the schema
    myConnector.getSchema = function(schemaCallback) {
        // Define your schema here
        var cols = [{
            id: "id",
            dataType: tableau.dataTypeEnum.string
        }, {
            id: "name",
            dataType: tableau.dataTypeEnum.string
        }
        // Add more columns as needed
        ];

        var tableSchema = {
            id: "apiData",
            alias: "API Data",
            columns: cols
        };

        schemaCallback([tableSchema]);
    };

    // Download the data
    myConnector.getData = function(table, doneCallback) {
        // Get the saved credentials and URLs
        var clientId = tableau.password.clientId;
        var clientSecret = tableau.password.clientSecret;
        var tokenUrl = tableau.password.tokenUrl;
        var apiUrl = tableau.password.apiUrl;

        // First, get the access token
        $.ajax({
            url: tokenUrl,
            type: 'POST',
            data: {
                grant_type: 'client_credentials',
                client_id: clientId,
                client_secret: clientSecret
            },
            success: function(tokenResponse) {
                // Now use the token to get the data
                $.ajax({
                    url: apiUrl,
                    headers: {
                        'Authorization': 'Bearer ' + tokenResponse.access_token
                    },
                    success: function(resp) {
                        var tableData = [];
                        
                        // Process your API response here
                        // This is just an example - adjust according to your API response structure
                        for (var i = 0; i < resp.data.length; i++) {
                            tableData.push({
                                "id": resp.data[i].id,
                                "name": resp.data[i].name
                            });
                        }

                        table.appendRows(tableData);
                        doneCallback();
                    },
                    error: function(xhr, status, error) {
                        tableau.abortWithError("Error fetching data: " + error);
                    }
                });
            },
            error: function(xhr, status, error) {
                tableau.abortWithError("Error getting token: " + error);
            }
        });
    };

    // Register events for when the user submits the form
    $(document).ready(function() {
        $("#submitButton").click(function() {
            // Save the form data in tableau.password
            tableau.password.clientId = $('#clientId').val().trim();
            tableau.password.clientSecret = $('#clientSecret').val().trim();
            tableau.password.tokenUrl = $('#tokenUrl').val().trim();
            tableau.password.apiUrl = $('#apiUrl').val().trim();

            tableau.connectionName = "OAuth2 API Connection";
            tableau.submit();
        });
    });

    tableau.registerConnector(myConnector);
})(); 
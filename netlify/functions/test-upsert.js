const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const logs = [];
  const log = (message) => {
    console.log(message);
    logs.push(message);
  };

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    log('Testing upsert with fixture_id: 438, provider_id: 1');

    const { data, error } = await supabase
      .from('broadcasts')
      .upsert({
        fixture_id: 438,
        provider_id: 1
      }, {
        onConflict: 'fixture_id'
      });

    if (error) {
      log(`UPSERT ERROR: ${JSON.stringify(error, null, 2)}`);
      return {
        statusCode: 500,
        body: JSON.stringify({
          logs,
          error: error.message,
          errorDetails: error,
          success: false
        })
      };
    }

    log('UPSERT SUCCESS');
    log(`Data returned: ${JSON.stringify(data, null, 2)}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        logs,
        success: true,
        data
      })
    };

  } catch (err) {
    log(`CAUGHT EXCEPTION: ${err.message}`);
    return {
      statusCode: 500,
      body: JSON.stringify({
        logs,
        error: err.message,
        success: false
      })
    };
  }
};
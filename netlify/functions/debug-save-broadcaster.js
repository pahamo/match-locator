const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event, context) => {
  const logs = [];
  const log = (message) => {
    console.log(message);
    logs.push(message);
  };

  log('=== DEBUG SAVE BROADCASTER START ===');
  log('Method: ' + event.httpMethod);
  log('Body: ' + event.body);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    log('ERROR: Method not allowed');
    return {
      statusCode: 405,
      body: JSON.stringify({ logs, error: 'Method not allowed' })
    };
  }

  try {
    log('=== PARSING BODY ===');
    const { fixtureId, providerId } = JSON.parse(event.body);
    log('Parsed: ' + JSON.stringify({ fixtureId, providerId, fixtureIdType: typeof fixtureId, providerIdType: typeof providerId }));

    log('=== VALIDATION ===');
    if (typeof fixtureId !== 'number') {
      log('ERROR: Invalid fixtureId type: ' + typeof fixtureId);
      return {
        statusCode: 400,
        body: JSON.stringify({ logs, error: 'Invalid input: fixtureId (number) required' })
      };
    }
    log('Validation passed');

    log('=== ENV CHECK ===');
    log('URL exists: ' + !!process.env.REACT_APP_SUPABASE_URL);
    log('Key exists: ' + !!process.env.SUPABASE_SERVICE_ROLE_KEY);

    if (!process.env.REACT_APP_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      log('CRITICAL: Missing environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ logs, error: 'Configuration error: Missing environment variables' })
      };
    }

    log('=== SUPABASE INIT ===');
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    log('Supabase client created');

    log('=== DATABASE OPERATION ===');
    if (providerId === null) {
      log('DELETE operation for fixture: ' + fixtureId);
      const { error } = await supabase
        .from('broadcasts')
        .delete()
        .eq('fixture_id', fixtureId);

      if (error) {
        log('DELETE failed: ' + JSON.stringify(error));
        return {
          statusCode: 500,
          body: JSON.stringify({ logs, error: 'Database delete failed', details: error.message })
        };
      }
      log('DELETE successful');
    } else {
      if (typeof providerId !== 'number') {
        log('ERROR: Invalid providerId type: ' + typeof providerId);
        return {
          statusCode: 400,
          body: JSON.stringify({ logs, error: 'Invalid input: providerId must be number or null' })
        };
      }

      log('UPDATE/INSERT operation with fixture_id: ' + fixtureId + ', provider_id: ' + parseInt(String(providerId)));

      // First try to update existing record
      const { data: updateData, error: updateError } = await supabase
        .from('broadcasts')
        .update({ provider_id: parseInt(String(providerId)) })
        .eq('fixture_id', fixtureId)
        .select();

      if (updateError) {
        log('UPDATE failed: ' + JSON.stringify(updateError));
        return {
          statusCode: 500,
          body: JSON.stringify({ logs, error: 'Database update failed', details: updateError.message })
        };
      }

      // If no rows were updated, insert a new record
      if (!updateData || updateData.length === 0) {
        log('No existing record, inserting new one');
        const { data, error } = await supabase
          .from('broadcasts')
          .insert({
            fixture_id: fixtureId,
            provider_id: parseInt(String(providerId))
          })
          .select();

        if (error) {
          log('INSERT failed: ' + JSON.stringify(error));
          return {
            statusCode: 500,
            body: JSON.stringify({ logs, error: 'Database insert failed', details: error.message })
          };
        }
        log('INSERT successful: ' + JSON.stringify(data));
      } else {
        log('UPDATE successful: ' + JSON.stringify(updateData));
      }
    }

    log('=== SUCCESS ===');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ logs, success: true })
    };

  } catch (error) {
    log('=== CAUGHT EXCEPTION ===');
    log('Error type: ' + error.constructor.name);
    log('Error message: ' + error.message);
    log('Error stack: ' + error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        logs,
        error: 'Internal server error',
        details: error.message,
        type: error.constructor.name
      })
    };
  }
};
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EncryptionService } from '@/infrastructure/services/EncryptionService';
import axios from 'axios';

/**
 * GET /api/erp/test/pos-orders
 * 
 * Test endpoint to fetch POS orders from Odoo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');

    if (!connectionId) {
      return NextResponse.json(
        { success: false, error: 'Connection ID is required' },
        { status: 400 }
      );
    }

    // Get connection from database
    const connection = await prisma.eRPConnection.findUnique({
      where: { id: connectionId },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!connection) {
      return NextResponse.json(
        { success: false, error: 'Connection not found' },
        { status: 404 }
      );
    }

    if (connection.status !== 'CONNECTED') {
      return NextResponse.json(
        { success: false, error: `Connection is ${connection.status}` },
        { status: 400 }
      );
    }

    // Decrypt credentials
    const credentials = EncryptionService.decrypt(connection.credentialsEncrypted);
    const { odooUrl, odooDatabase, odooUsername, odooPassword } = credentials;

    // Step 1: Authenticate with Odoo
    const baseUrl = odooUrl.split('?')[0].replace(/\/$/, '');
    const authUrl = `${baseUrl}/web/session/authenticate`;

    console.log('🔐 Authenticating with Odoo for POS orders:', {
      url: authUrl,
      database: odooDatabase,
      username: odooUsername,
    });

    const authResponse = await axios.post(authUrl, {
      jsonrpc: '2.0',
      params: {
        db: odooDatabase,
        login: odooUsername,
        password: odooPassword,
      },
    });

    if (!authResponse.data.result || !authResponse.data.result.uid) {
      return NextResponse.json(
        { success: false, error: 'Failed to authenticate with Odoo' },
        { status: 401 }
      );
    }

    console.log('✅ Authenticated with UID:', authResponse.data.result.uid);

    // Step 2: Fetch POS orders using search_read
    const searchUrl = `${baseUrl}/web/dataset/search_read`;
    
    console.log('📦 Fetching POS orders from:', searchUrl);

    const ordersResponse = await axios.post(
      searchUrl,
      {
        jsonrpc: '2.0',
        params: {
          model: 'pos.order',
          domain: [], // Get all orders
          fields: [
            'name',
            'date_order',
            'amount_total',
            'currency_id',
            'state',
            'partner_id',
            'session_id',
          ],
          limit: 100,
          sort: 'date_order desc', // Most recent first
        },
      },
      {
        headers: {
          'Cookie': authResponse.headers['set-cookie']?.join('; ') || '',
        },
      }
    );

    console.log('📊 Response from Odoo:', {
      hasResult: !!ordersResponse.data.result,
      hasRecords: !!ordersResponse.data.result?.records,
      recordCount: ordersResponse.data.result?.records?.length || 0,
    });

    if (ordersResponse.data.result && ordersResponse.data.result.records) {
      const orders = ordersResponse.data.result.records.map((record: any) => ({
        id: record.id.toString(),
        name: record.name || `Order ${record.id}`,
        date: record.date_order,
        amount: record.amount_total || 0,
        currency: record.currency_id?.[1] || 'AED',
        status: record.state || 'draft',
        partner: record.partner_id?.[1] || null,
        session: record.session_id?.[1] || null,
      }));

      console.log(`✅ Successfully fetched ${orders.length} POS orders`);

      return NextResponse.json({
        success: true,
        data: orders,
        count: orders.length,
        message: `Successfully fetched ${orders.length} POS orders from Odoo`,
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
      count: 0,
      message: 'No POS orders found in Odoo',
    });
  } catch (error: any) {
    console.error('❌ Error fetching POS orders:', error);
    
    let errorMessage = 'Failed to fetch POS orders';
    
    if (error.response) {
      errorMessage = `Odoo API error: ${error.response.status} - ${error.response.statusText}`;
      console.error('Response data:', error.response.data);
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}


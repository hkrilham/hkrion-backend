import { NextResponse } from 'next/server'
import { openApiSpec } from '@/openapi/spec'

// Return the OpenAPI spec as JSON
export async function GET() {
  return NextResponse.json(openApiSpec, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

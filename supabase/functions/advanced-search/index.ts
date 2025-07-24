
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const searchParams = url.searchParams

    // Parse search parameters
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : null
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : null
    const minRating = searchParams.get('min_rating') ? parseFloat(searchParams.get('min_rating')!) : null
    const sortBy = searchParams.get('sort_by') || 'created_at'
    const sortOrder = searchParams.get('sort_order') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    console.log('Search parameters:', { query, category, minPrice, maxPrice, minRating, sortBy, sortOrder, page, limit })

    // Build the query - Only show approved products for public search
    let queryBuilder = supabase
      .from('products')
      .select('*')
      .eq('status', 'approved')

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Category filter
    if (category) {
      queryBuilder = queryBuilder.eq('category', category)
    }

    // Price range filter
    if (minPrice !== null) {
      queryBuilder = queryBuilder.gte('price', minPrice)
    }
    if (maxPrice !== null) {
      queryBuilder = queryBuilder.lte('price', maxPrice)
    }

    // Rating filter
    if (minRating !== null) {
      queryBuilder = queryBuilder.gte('average_rating', minRating)
    }

    // Sorting
    const validSortColumns = ['created_at', 'price', 'average_rating', 'name']
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at'
    const sortDirection = sortOrder === 'asc' ? true : false
    
    queryBuilder = queryBuilder.order(sortColumn, { ascending: sortDirection })

    // Pagination
    queryBuilder = queryBuilder.range(offset, offset + limit - 1)

    const { data: products, error } = await queryBuilder

    if (error) {
      console.error('Error searching products:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to search products', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Found products:', products?.length || 0)

    // Fetch seller profiles separately for each product
    const enrichedProducts = []
    
    if (products && products.length > 0) {
      for (const product of products) {
        let sellerProfile = null
        
        if (product.seller_id) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('name, phone, avatar_url')
            .eq('id', product.seller_id)
            .single()
            
          if (profile && !profileError) {
            sellerProfile = profile
          }
        }
        
        enrichedProducts.push({
          ...product,
          profiles: sellerProfile
        })
      }
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')

    if (query) {
      countQuery = countQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    }
    if (category) {
      countQuery = countQuery.eq('category', category)
    }
    if (minPrice !== null) {
      countQuery = countQuery.gte('price', minPrice)
    }
    if (maxPrice !== null) {
      countQuery = countQuery.lte('price', maxPrice)
    }
    if (minRating !== null) {
      countQuery = countQuery.gte('average_rating', minRating)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error counting products:', countError)
    }

    console.log('Search results:', { 
      query, category, minPrice, maxPrice, minRating, 
      page, limit,
      resultsCount: enrichedProducts?.length || 0,
      totalCount: count || 0
    })

    return new Response(
      JSON.stringify({ 
        success: true,
        products: enrichedProducts || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          hasMore: count ? (offset + limit) < count : false
        },
        filters: {
          query,
          category,
          minPrice,
          maxPrice,
          minRating
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in advanced search:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

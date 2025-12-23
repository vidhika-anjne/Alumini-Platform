"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function DiagnosticPage() {
  const [checks, setChecks] = useState<Array<{ name: string; status: 'pending' | 'success' | 'error'; message: string }>>([
    { name: 'Supabase Connection', status: 'pending', message: 'Checking...' },
    { name: 'User Authentication', status: 'pending', message: 'Checking...' },
    { name: 'Profiles Table', status: 'pending', message: 'Checking...' },
    { name: 'Alumni Profiles Table', status: 'pending', message: 'Checking...' },
    { name: 'Conversations Table', status: 'pending', message: 'Checking...' },
    { name: 'Messages Table', status: 'pending', message: 'Checking...' },
  ])

  useEffect(() => {
    runDiagnostics()
  }, [])

  async function runDiagnostics() {
    const supabase = createClient()
    const newChecks = [...checks]

    // Check 1: Supabase Connection
    try {
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
      if (error) throw error
      newChecks[0] = { name: 'Supabase Connection', status: 'success', message: 'Connected successfully' }
    } catch (error) {
      newChecks[0] = { name: 'Supabase Connection', status: 'error', message: error instanceof Error ? error.message : 'Connection failed' }
    }
    setChecks([...newChecks])

    // Check 2: User Authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      if (user) {
        newChecks[1] = { name: 'User Authentication', status: 'success', message: `Logged in as ${user.email}` }
      } else {
        newChecks[1] = { name: 'User Authentication', status: 'error', message: 'Not authenticated' }
      }
    } catch (error) {
      newChecks[1] = { name: 'User Authentication', status: 'error', message: error instanceof Error ? error.message : 'Auth check failed' }
    }
    setChecks([...newChecks])

    // Check 3: Profiles Table
    try {
      const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      if (error) throw error
      newChecks[2] = { name: 'Profiles Table', status: 'success', message: `Found ${count || 0} profiles` }
    } catch (error) {
      newChecks[2] = { name: 'Profiles Table', status: 'error', message: error instanceof Error ? error.message : 'Table check failed' }
    }
    setChecks([...newChecks])

    // Check 4: Alumni Profiles Table
    try {
      const { count, error } = await supabase.from('alumni_profiles').select('*', { count: 'exact', head: true })
      if (error) throw error
      newChecks[3] = { name: 'Alumni Profiles Table', status: 'success', message: `Found ${count || 0} alumni profiles` }
    } catch (error) {
      newChecks[3] = { name: 'Alumni Profiles Table', status: 'error', message: error instanceof Error ? error.message : 'Table check failed' }
    }
    setChecks([...newChecks])

    // Check 5: Conversations Table
    try {
      const { count, error } = await supabase.from('conversations').select('*', { count: 'exact', head: true })
      if (error) throw error
      newChecks[4] = { name: 'Conversations Table', status: 'success', message: `Found ${count || 0} conversations (table exists)` }
    } catch (error) {
      newChecks[4] = { name: 'Conversations Table', status: 'error', message: error instanceof Error ? error.message : 'Table not found - Run migration!' }
    }
    setChecks([...newChecks])

    // Check 6: Messages Table
    try {
      const { count, error } = await supabase.from('messages').select('*', { count: 'exact', head: true })
      if (error) throw error
      newChecks[5] = { name: 'Messages Table', status: 'success', message: `Found ${count || 0} messages (table exists)` }
    } catch (error) {
      newChecks[5] = { name: 'Messages Table', status: 'error', message: error instanceof Error ? error.message : 'Table not found - Run migration!' }
    }
    setChecks([...newChecks])
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">System Diagnostics</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Database & Connection Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {check.status === 'pending' && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
                {check.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {check.status === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                <div>
                  <p className="font-semibold">{check.name}</p>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
              </div>
              <Badge variant={check.status === 'success' ? 'default' : check.status === 'error' ? 'destructive' : 'secondary'}>
                {check.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ If you see errors:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
          <li>Check your <code className="bg-yellow-100 px-1 rounded">.env.local</code> file has correct Supabase credentials</li>
          <li>If "Conversations Table" or "Messages Table" fails, run the migration in Supabase SQL Editor</li>
          <li>File: <code className="bg-yellow-100 px-1 rounded">scripts/EXECUTE_THIS_004_create_chat_tables.sql</code></li>
          <li>If "Not authenticated", login first at <code className="bg-yellow-100 px-1 rounded">/auth/login</code></li>
        </ol>
      </div>
    </div>
  )
}

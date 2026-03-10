import { createClient } from '@supabase/supabase-js'
import { createReadStream } from 'fs'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CSV_DIR = join(__dirname, '..', 'churchDB')

const SUPABASE_URL = 'https://zidvplwggyfmwvtffxyv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_GW-jcJ04iO4PEoP7DQBAAw_-YpLV-rM'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function cleanRow(row) {
    const cleaned = {}
    for (const [k, v] of Object.entries(row)) {
        const val = (typeof v === 'string') ? v.trim() : v
        if (val === '' || val === null || val === undefined) {
            cleaned[k] = null
        } else if (val === 'TRUE' || val === 'true') {
            cleaned[k] = true
        } else if (val === 'FALSE' || val === 'false') {
            cleaned[k] = false
        } else {
            cleaned[k] = val
        }
    }
    return cleaned
}

function readCSVSync(filename) {
    const filepath = join(CSV_DIR, filename)
    if (!existsSync(filepath)) {
        console.log(`   ⚠️  File not found, skipping: ${filename}`)
        return []
    }
    const content = readFileSync(filepath, 'utf-8')
    const records = parse(content, { columns: true, trim: true, skip_empty_lines: true })
    return records.map(cleanRow)
}

async function importTable(tableName, csvFile) {
    console.log(`\n📦 [${tableName}] Reading ${csvFile}...`)
    const rows = readCSVSync(csvFile)

    if (rows.length === 0) {
        console.log(`   ⚠️  No rows to import.`)
        return
    }

    console.log(`   Found ${rows.length} rows. Upserting...`)

    let inserted = 0
    let errors = 0
    const BATCH = 50

    for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH)
        const { error } = await supabase.from(tableName).upsert(batch, { onConflict: 'id' })
        if (error) {
            console.error(`   ❌ Batch ${Math.floor(i / BATCH) + 1} error: ${error.message}`)
            errors++
        } else {
            inserted += batch.length
            process.stdout.write(`   ✅ ${inserted}/${rows.length}\r`)
        }
    }

    if (errors === 0) {
        console.log(`   ✅ Done! Imported ${inserted}/${rows.length} rows.`)
    } else {
        console.log(`   ⚠️  Imported ${inserted}/${rows.length} rows (${errors} batch errors).`)
    }
}

async function main() {
    console.log('🚀 Starting ChurchDB import (sequential)...')

    const tables = [
        { table: 'members', file: 'EffectiveChurch - Members.csv' },
        { table: 'visitors', file: 'EffectiveChurch - Visitors.csv' },
        { table: 'staff', file: 'EffectiveChurch - Staff.csv' },
        { table: 'groups', file: 'EffectiveChurch - Groups.csv' },
        { table: 'activities', file: 'EffectiveChurch - Activities.csv' },
        { table: 'attendance_records', file: 'EffectiveChurch - AttendanceRecords.csv' },
        { table: 'tasks', file: 'EffectiveChurch - Tasks.csv' },
        { table: 'announcements', file: 'EffectiveChurch - Announcements.csv' },
        { table: 'donations', file: 'EffectiveChurch - Donations.csv' },
        { table: 'prayer_requests', file: 'EffectiveChurch - PrayerRequests.csv' },
        { table: 'transactions', file: 'EffectiveChurch - Transactions.csv' },
        { table: 'training_programs', file: 'EffectiveChurch - TrainingPrograms.csv' },
    ]

    for (const { table, file } of tables) {
        try {
            await importTable(table, file)
        } catch (err) {
            console.error(`   ❌ Unexpected error for ${table}: ${err.message}`)
        }
    }

    console.log('\n\n🎉 Import complete! Checking final counts...')

    // Final count check
    for (const { table } of tables) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true })
        console.log(`   ${table}: ${count} rows`)
    }
}

main()

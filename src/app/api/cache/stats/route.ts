import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const CACHE_DIR = path.join(process.cwd(), '.cache');

export async function GET() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    let totalSize = 0;

    for (const file of files) {
      const stats = await fs.stat(path.join(CACHE_DIR, file));
      totalSize += stats.size;
    }

    return NextResponse.json({
      size: totalSize,
      files: files.length
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
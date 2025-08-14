import { NextRequest, NextResponse } from 'next/server'
import { uploadEmployeeExcel } from '@/services/employeeDataService'
import { promises as fs } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    // 파일 형식 검증
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { success: false, error: '엑셀 파일(.xlsx, .xls)만 업로드 가능합니다.' },
        { status: 400 }
      )
    }

    // 파일 처리
    const result = await uploadEmployeeExcel(file)
    
    if (result.success) {
      // 성공한 경우 파일을 temp 폴더에 저장
      try {
        const tempPath = path.join(process.cwd(), 'temp')
        
        // temp 폴더가 없으면 생성
        await fs.mkdir(tempPath, { recursive: true })
        
        // 현재 업로드된 파일을 current_data.xlsx로 저장
        const targetPath = path.join(tempPath, 'current_data.xlsx')
        const arrayBuffer = await file.arrayBuffer()
        await fs.writeFile(targetPath, Buffer.from(arrayBuffer))
        
        console.log('업로드된 파일 저장 완료:', targetPath)
      } catch (saveError) {
        console.log('파일 저장 실패 (캐시만 사용):', saveError)
      }
      
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: '파일 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
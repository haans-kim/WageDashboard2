import { NextRequest, NextResponse } from 'next/server'
import { uploadEmployeeExcel } from '@/services/employeeDataService'

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
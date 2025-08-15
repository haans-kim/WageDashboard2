/**
 * 클라이언트 사이드 데이터 저장소
 * IndexedDB를 사용하여 브라우저에 엑셀 데이터 저장
 */

interface StoredData {
  employees: any[]
  competitorData: any[]
  competitorIncreaseRate?: number
  aiSettings: any
  uploadedAt: string
  fileName: string
}

const DB_NAME = 'WageDashboardDB'
const DB_VERSION = 1
const STORE_NAME = 'excelData'

/**
 * IndexedDB 초기화
 */
function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Client-side only function'))
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

/**
 * 데이터 저장
 */
export async function saveExcelData(data: StoredData): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Client-side only function')
  }
  
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    // id를 'current'로 고정하여 항상 덮어쓰기
    await store.put({ ...data, id: 'current' })
    
    // localStorage에도 간단한 메타데이터 저장
    localStorage.setItem('wageDashboard_hasData', 'true')
    localStorage.setItem('wageDashboard_fileName', data.fileName)
    localStorage.setItem('wageDashboard_uploadedAt', data.uploadedAt)
    
    console.log('데이터가 브라우저에 저장되었습니다.')
  } catch (error) {
    console.error('데이터 저장 실패:', error)
    throw error
  }
}

/**
 * 데이터 불러오기
 */
export async function loadExcelData(): Promise<StoredData | null> {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    return new Promise((resolve, reject) => {
      const request = store.get('current')
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  } catch (error) {
    console.error('데이터 불러오기 실패:', error)
    return null
  }
}

/**
 * 데이터 삭제
 */
export async function clearExcelData(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const db = await openDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    await store.delete('current')
    
    // localStorage도 클리어
    localStorage.removeItem('wageDashboard_hasData')
    localStorage.removeItem('wageDashboard_fileName')
    localStorage.removeItem('wageDashboard_uploadedAt')
    
    console.log('저장된 데이터가 삭제되었습니다.')
  } catch (error) {
    console.error('데이터 삭제 실패:', error)
    throw error
  }
}

/**
 * 데이터 존재 여부 확인 (빠른 체크)
 */
export function hasStoredData(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return localStorage.getItem('wageDashboard_hasData') === 'true'
}

/**
 * 저장된 파일 정보 가져오기
 */
export function getStoredFileInfo(): { fileName: string; uploadedAt: string } | null {
  if (typeof window === 'undefined') {
    return null
  }
  const fileName = localStorage.getItem('wageDashboard_fileName')
  const uploadedAt = localStorage.getItem('wageDashboard_uploadedAt')
  
  if (fileName && uploadedAt) {
    return { fileName, uploadedAt }
  }
  return null
}
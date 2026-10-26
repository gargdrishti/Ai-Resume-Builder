import React, { useEffect, useState, useContext } from 'react'
import { useParams, Link } from 'react-router-dom'
import ResumePreview from '../componets/ResumePreview'
import Loader from '../componets/Loader'
import { ArrowLeftIcon } from 'lucide-react'
import { AppContext } from '../context/appContext'

const Preview = () => {
  const { resumeId } = useParams()
  const { getPublicResumeById } = useContext(AppContext)

  const [resumeData, setResumeData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadResume = async () => {
    setIsLoading(true)
    try {
      const data = await getPublicResumeById(resumeId)
      setResumeData(data)
    } catch (err) {
      console.error("Failed to load public resume:", err)
      setResumeData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResume()
  }, [resumeId])

  return resumeData ? (
    <div className='bg-slate-100'>
      <div className='max-w-3xl mx-auto py-10 px-4'>
        <ResumePreview 
          data={resumeData} 
          template={resumeData.template} 
          accentColor={resumeData.accent_color}
          classes='py-4 bg-white'
        />
      </div>
    </div>
  ) : (
    <div>
      {isLoading ? <Loader /> : (
        <div className='flex flex-col items-center justify-center h-screen'>
          <p className='text-center text-6xl text-slate-400 font-medium'>Resume not found</p>
          <Link to="/" className='mt-6 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring-1 ring-green-400 flex items-center transition-colors'>
            <ArrowLeftIcon className='mr-2 size-4' />
            go to home page
          </Link>
        </div>
      )}
    </div>
  )
}

export default Preview
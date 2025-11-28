import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { uploadApi } from '../../api/upload'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 10,
  disabled = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || uploading) return

      const remainingSlots = maxImages - images.length
      const filesToUpload = acceptedFiles.slice(0, remainingSlots)

      if (filesToUpload.length === 0) {
        alert(`Solo puedes subir hasta ${maxImages} imágenes`)
        return
      }

      setUploading(true)

      try {
        const result = await uploadApi.uploadImages(filesToUpload)
        console.log('Imágenes subidas:', result.urls)
        onChange([...images, ...result.urls])
      } catch (error: any) {
        console.error('Error al subir imágenes:', error)
        alert(`Error al subir imágenes: ${error.response?.data?.message || error.message}`)
      } finally {
        setUploading(false)
        setUploadProgress({})
      }
    },
    [images, onChange, maxImages, disabled, uploading]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    disabled: disabled || uploading || images.length >= maxImages,
    multiple: true,
  })

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex)
    }
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }
          ${disabled || uploading || images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Suelta las imágenes aquí'
            : 'Arrastra imágenes aquí o haz clic para seleccionar'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          {images.length}/{maxImages} imágenes
        </p>
      </div>

      {uploading && (
        <div className="text-sm text-gray-600 text-center">
          Subiendo imágenes...
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`
                relative group aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-move
                ${
                  draggedIndex === index
                    ? 'opacity-50 scale-95 border-primary-500 border-dashed'
                    : dragOverIndex === index
                    ? 'border-primary-500 border-solid scale-105 shadow-lg'
                    : 'border-gray-200'
                }
              `}
            >
              <img
                src={url}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  console.error('Error al cargar imagen:', url)
                  e.currentTarget.src = '/placeholder.jpg'
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveImage(index, index - 1)
                      }}
                      className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                      title="Mover izquierda"
                    >
                      ←
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveImage(index, index + 1)
                      }}
                      className="bg-white text-gray-700 p-2 rounded-full hover:bg-gray-100"
                      title="Mover derecha"
                    >
                      →
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(index)
                    }}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                    title="Eliminar"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs px-2 py-1 rounded z-10">
                  Principal
                </div>
              )}
              {draggedIndex === index && (
                <div className="absolute inset-0 bg-primary-500 bg-opacity-20 flex items-center justify-center z-20">
                  <p className="text-white font-semibold">Arrastrando...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


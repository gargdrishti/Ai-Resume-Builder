import React from 'react'
import ClassicTemplate from './templates/ClassicTemplate'
import MinimalTemplate from './templates/MinimalTemplate'
import MinimalImageTemplate from './templates/MinimalImageTemplate'
import ModernTemplate from './templates/ModernTemplate'
import CreativeTemplate from './templates/CreativeTemplate'
import ExecutiveTemplate from './templates/ExecutiveTemplate'
import AcademicTemplate from './templates/AcademicTemplate'
import DeveloperTemplate from './templates/DeveloperTemplate'

const ResumePreview = ({data, template, accentColor, classes = ""}) => {

    const renderTemplate = ()=>{
        switch (template) {
            case "modern":
                return <ModernTemplate data={data} accentColor={accentColor}/>;
            case "minimal":
                return <MinimalTemplate data={data} accentColor={accentColor}/>;
            case "minimal-image":
                return <MinimalImageTemplate data={data} accentColor={accentColor}/>;
            case "creative":
                return <CreativeTemplate data={data} accentColor={accentColor} ascentColor={accentColor}/>;
            case "executive":
                return <ExecutiveTemplate data={data} accentColor={accentColor} ascentColor={accentColor}/>;
            case "academic":
                return <AcademicTemplate data={data} accentColor={accentColor} ascentColor={accentColor}/>;
            case "developer":
                return <DeveloperTemplate data={data} accentColor={accentColor} ascentColor={accentColor}/>;
            
            default:
                return <ClassicTemplate data={data} accentColor={accentColor}/>;
        }
    }

    return (
        <div className='w-full bg-gray-100'>
            <div id="resume-preview" className={"border border-gray-200 print:shadow-none print:border-none " + classes}>
                {renderTemplate()}
            </div>

            <style>
                {`
                @page {
                    size: letter;
                    margin: 0;
                }
                @media print {
                    body {
                        background: #ffffff !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #resume-preview, #resume-preview * {
                        visibility: visible;
                    }
                    #resume-preview {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        height: auto;
                        margin: 0;
                        padding: 0;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
                `}
            </style>
        </div>
    )
}

export default ResumePreview
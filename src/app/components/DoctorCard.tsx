import { Doctor } from "../types";

export default function DoctorCard({ doctor }: { doctor: Doctor }) {
  return (
    <div className="bg-primary-100 rounded-xl shadow-md overflow-hidden border border-primary-200 hover:shadow-lg transition-shadow duration-300">
      {/* Doctor Header */}
      <div className="bg-primary-600 p-4 text-grey-100 flex items-center">
        <div className="w-16 h-16 bg-primary-100 border rounded-full flex items-center justify-center mr-4">
          <span className="text-primary-600 font-bold text-2xl">
            {doctor.name.charAt(0)}
          </span>
        </div>
        <div>
          <h3 className="font-bold text-xl text-primary-100">
            Dr. {doctor.name}
          </h3>
          <p className="text-primary-300">
            {doctor.specialty || 'Plastic Surgeon'}
          </p>
        </div>
      </div>

      {/* Doctor Details */}
      <div className="p-5">
        {/* Key Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-primary-500">Experience</p>
            <p className="font-medium text-primary-700">
              {doctor.experience || '10+ years'}
            </p>
          </div>
          <div>
            <p className="text-sm text-primary-500">Education</p>
            <p className="font-medium text-primary-700">
              {doctor.education || 'MD, Harvard Medical School'}
            </p>
          </div>
          {doctor.phone && (
            <div>
              <p className="text-sm text-primary-500">Contact</p>
              <p className="font-medium text-primary-700">{doctor.phone}</p>
            </div>
          )}
          {doctor.email && (
            <div>
              <p className="text-sm text-primary-500">Email</p>
              <p className="font-medium text-primary-700 truncate">{doctor.email}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        {doctor.skills && doctor.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-primary-700 mb-2">
              Specializations
            </h4>
            <div className="flex flex-wrap gap-2">
              {doctor.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-primary-200  text-xs px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {doctor.bio && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-primary-700 mb-1">
              About
            </h4>
            <p className="text-primary-600 text-sm">{doctor.bio}</p>
          </div>
        )}

        {/* Certifications */}
        {doctor.certifications && doctor.certifications.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-primary-700 mb-2">
              Certifications
            </h4>
            <ul className="space-y-1">
              {doctor.certifications.map((cert, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="h-4 w-4 text-primary-500 mt-0.5 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-primary-600 text-sm">{cert}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div> 
    </div>
  );
}

import DoctorSidebar from "../../components/DoctorDashboard/DoctorSidebar";
import DoctorHeader from "../../components/DoctorDashboard/DoctorHeader";
import AIAssessment from "../../components/AIAssessment/AIAssessment";

import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosinstance.js";

import "./DoctorMonitoring.css";


const DoctorMonitoring = () => {

  const [patients, setPatients] =
    useState([]);

  const [isLoading, setIsLoading] =
    useState(true);


  /* ============================================================
     LOAD DOCTOR PATIENTS
  ============================================================ */

  const loadPatients = async () => {

    try {

      setIsLoading(true);

      const response =
        await axiosInstance.get(
          "/doctor/patients"
        );

      setPatients(
        response.data?.patients || []
      );

    } catch (error) {

      console.error(
        "Unable to load patients for monitoring:",
        error
      );

      setPatients([]);

    } finally {

      setIsLoading(false);

    }

  };


  useEffect(() => {
    loadPatients();
  }, []);


  return (
    <div className="doctor-dashboard">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <DoctorSidebar
        activePage="Patient Monitoring"
      />


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="doctor-dashboard__main">

        <DoctorHeader />


        <div className="doctor-dashboard__content doctor-monitoring">


          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <section className="doctor-monitoring__header">

            <div>

              <span>
                PATIENT MONITORING
              </span>

              <h1>
                AI Patient Assessment
              </h1>

              <p>
                Analyze patient MRI or CT images
                and review AI-assisted assessment
                results.
              </p>

            </div>

          </section>


          {/* ==================================================
              AI ASSESSMENT
          ================================================== */}

          {isLoading ? (

            <section className="doctor-dashboard__card doctor-monitoring__loading">

              <span>
                Loading patients...
              </span>

            </section>

          ) : (

            <AIAssessment
              patients={patients}
            />

          )}

        </div>

      </main>

    </div>
  );
};


export default DoctorMonitoring;
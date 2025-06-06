import React from 'react';
import { Link } from 'react-router-dom';
import LandingAcademics from './LandingAcademics.jsx';
import ExamResults from './ExamResults.jsx';

const Academics = () => {
    return (
        <>
        <LandingAcademics />
        <ExamResults />
      </>
    );
};

export default Academics;
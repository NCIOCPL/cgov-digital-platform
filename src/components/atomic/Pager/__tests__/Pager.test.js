import React from 'react';
import { render, mount } from 'enzyme';
import Pager from '../Pager';

const defaultProps = {
  data: [
    {
      title: 'Desmoid Tumor - National Cancer Institute',
      url:
        'https://www.cancer.gov/pediatric-adult-rare-tumor/rare-tumors/rare-soft-tissue-tumors/desmoid-tumor',
      contentType: 'cgvArticle',
      description:
        'Desmoid tumors grow from the connective tissue in your body. Desmoid tumors are benign, which means they are not cancer, but they are very difficult to get rid of and can be painful to live with. Learn more about diagnosis, treatments, and prognosis for desmoid tumors.',
    },
    {
      title: 'Rare Tumors - National Cancer Institute',
      url: 'https://www.cancer.gov/pediatric-adult-rare-tumor/rare-tumors',
      contentType: 'cgvMiniLanding',
      description:
        'Rare tumors can form anywhere in the body. My Pediatric and Adult Rare Tumor Network (MyPART) is studying tumors in several different body systems.',
    },
    {
      title: 'Tumor Markers - National Cancer Institute',
      url:
        'https://www.cancer.gov/about-cancer/diagnosis-staging/diagnosis/tumor-markers-fact-sheet',
      contentType: 'cgvArticle',
      description:
        'A fact sheet that defines tumor markers and describes how they can be used to aid diagnosis and treatment.',
    },
    {
      title: 'Brain Tumors—Patient Version - National Cancer Institute',
      url: 'https://www.cancer.gov/types/brain',
      contentType: 'cgvCancerTypeHome',
      description:
        'Brain tumors are growths of malignant cells in tissues of the brain. Tumors that start in the brain are called primary brain tumors. Tumors that spread to the brain are called metastatic brain tumors. Start here to find information on brain cancer treatment, research, and statistics.',
    },
    {
      title:
        'Brain Tumors—Health Professional Version - National Cancer Institute',
      url: 'https://www.cancer.gov/types/brain/hp',
      contentType: 'cgvCancerTypeHome',
      description:
        'Brain and spinal cord tumors include anaplastic astrocytomas and glioblastomas, meningiomas, pituitary tumors, schwannomas, ependymomas, and sarcomas. Find evidence-based information on brain tumor treatment, research, genetics, and statistics.',
    },
    {
      title: 'Pituitary Tumors—Patient Version - National Cancer Institute',
      url: 'https://www.cancer.gov/types/pituitary',
      contentType: 'cgvCancerTypeHome',
      description:
        'Pituitary tumors are usually not cancer and are called pituitary adenomas. They grow slowly and do not spread. Rarely, pituitary tumors are cancer and they can spread to distant parts of the body. Start here to find information on pituitary tumors treatment.',
    },
    {
      title:
        'Pituitary Tumors—Health Professional Version - National Cancer Institute',
      url: 'https://www.cancer.gov/types/pituitary/hp',
      contentType: 'cgvCancerTypeHome',
      description:
        'Pituitary tumors represent from 10% to 25% of all intracranial neoplasms. Pituitary tumors can be classified into three groups: benign adenoma, invasive adenoma, and carcinoma. Find evidence-based information on pituitary tumors treatment.',
    },
    {
      title:
        'Wilms Tumor and Other Childhood Kidney Tumors Treatment (PDQ®)–Patient Version - National Cancer Institute',
      url: 'https://www.cancer.gov/types/kidney/patient/wilms-treatment-pdq',
      contentType: 'pdqCancerInfoSummary',
      description:
        'Wilms tumor and other childhood kidney tumors treatment usually includes surgery and may be followed by radiation therapy or chemotherapy. Other treatments may include immunotherapy or high-dose chemotherapy with stem cell rescue. Learn more in this expert-reviewed summary.',
    },
    {
      title:
        'Pineal Region Tumor Survivor Lives Fully with Inoperable Tumor - National Cancer Institute',
      url:
        'https://www.cancer.gov/rare-brain-spine-tumor/blog/2019/pineal-survivor',
      contentType: 'cgvBlogPost',
      description:
        'A pineal region tumor survivor shares how he found the best care, treatments and resources to live.',
    },
    {
      title:
        'Pancreatic Neuroendocrine Tumors (Islet Cell Tumors) Treatment (PDQ®)–Patient Version - National Cancer Institute',
      url:
        'https://www.cancer.gov/types/pancreatic/patient/pnet-treatment-pdq',
      contentType: 'pdqCancerInfoSummary',
      description:
        'Pancreatic neuroendocrine tumors (islet cell tumors) treatments include surgery, hormone therapy, chemotherapy, targeted therapy, and supportive care. Learn more about the treatment of newly diagnosed and recurrent pancreatic neuroendocrine tumors in this expert-reviewed summary.',
    },
  ],
  startFromPage: 0,
  numberToShow: 5,
  callback: jest.fn()
}

const setup = (enzymeMethod = render, props = {}) => {
  const component = enzymeMethod(
    <Pager {...props} />
  );
  return component;
};

describe('Pager', () => {
  describe('Render', () => {

    it('renders without error', () => {
      const component = setup(render, defaultProps);
      expect(component).toMatchSnapshot();
    });

    it('divides the total number of items with the number of items to show and renders one item for each division', () => {
      const component = setup(mount, defaultProps);
      const divisions = Math.ceil(defaultProps.data.length / defaultProps.numberToShow);
      expect(component.find('.pager__num')).toHaveLength(divisions);
    });

  });

});

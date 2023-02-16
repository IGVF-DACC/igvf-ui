/**
 * Holds schema profiles for Jest testing. Make sure to update these if relevant real schemas
 * change. Just copy the new versions from igvfd /profiles.
 */
const profiles = {
  Award: {
    title: "Grant",
    $id: "/profiles/award.json",
    required: ["name", "project", "title"],
    identifyingProperties: ["uuid", "name", "title", "aliases"],
    type: "object",
    properties: {
      "@id": {
        title: "ID",
        type: "string",
        notSubmittable: true,
      },
      "@type": {
        title: "Type",
        type: "array",
        items: {
          type: "string",
        },
        notSubmittable: true,
      },
      component: {
        title: "Project Component",
        description: "The project component the award is associated with.",
        type: "string",
        permission: "import_items",
        enum: [
          "affiliate",
          "data analysis",
          "data coordination",
          "functional characterization",
          "mapping",
          "networks",
          "predictive modeling",
        ],
      },
      name: {
        title: "Name",
        description:
          "The official grant number from the NIH database, if applicable",
        type: "string",
        pattern: "^[A-Za-z0-9\\-]+$",
        uniqueKey: true,
      },
      number_array: {
        title: "Number Array",
        description: "An array of numbers only for Jest testing.",
        type: "array",
        items: {
          type: "number",
        },
      },
      object_array: {
        title: "Object Array",
        description: "An array of unknown objects for Jest testing",
        type: "array",
        items: {
          title: "Object Array Items",
          type: "object",
          properties: {
            object: {
              title: "Object Array Item",
              type: "string",
            },
          },
        },
      },
      simple_array: {
        title: "Simple array",
        description: "A simple array used for empty-array Jest testing",
        type: "array",
        items: {
          type: "string",
        },
      },
      pi: {
        title: "P.I.",
        description: "Principal Investigator(s) of the grant.",
        comment: "See user.json for available identifiers.",
        type: "array",
        uniqueItems: true,
        items: {
          title: "Investigator",
          description: "User object of the investigator.",
          type: "string",
          linkTo: "User",
        },
      },
      om: {
        title: "Office Managers",
        description: "Non-real office manager property for Jest testing.",
        comment: "See user.json for available identifiers.",
        type: "array",
        uniqueItems: true,
        items: {
          title: "Manager",
          description: "User object of the office manager.",
          type: "string",
          linkTo: "User",
        },
      },
      studied_by: {
        title: "Studied By",
        description: "Non-real studied-by property for Jest testing.",
        comment: "See user.json for available identifiers.",
        type: "array",
        uniqueItems: true,
        items: {
          title: "Student",
          description: "User object of the student.",
          type: "string",
          linkTo: "User",
        },
      },
      project: {
        title: "Project",
        description:
          "The collection of biological data related to a single initiative, originating from a consortium.",
        type: "string",
        enum: ["community", "ENCODE", "IGVF"],
      },
      status: {
        title: "Status",
        type: "string",
        default: "current",
        enum: ["current", "deleted", "disabled"],
      },
      submitted_by: {
        "rdfs:subPropertyOf": "dc:creator",
        title: "Submitted By",
        comment:
          "Do not submit. The user that created the object is assigned by the server.",
        type: "string",
        linkTo: "User",
        serverDefault: "userid",
        permission: "import_items",
      },
      proposed_by: {
        "rdfs:subPropertyOf": "dc:creator",
        title: "Proposed By",
        comment: "Non-existing property just used for Jest testing",
        type: "string",
        linkTo: "User",
        serverDefault: "userid",
        permission: "import_items",
      },
      verified_by: {
        "rdfs:subPropertyOf": "dc:creator",
        title: "Verified By",
        comment: "Non-existing property just used for Jest testing",
        type: "string",
        linkTo: "User",
        serverDefault: "userid",
        permission: "import_items",
      },
      title: {
        "rdfs:subPropertyOf": "dc:title",
        title: "Title",
        description: "The grant name from the NIH database, if applicable.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
      },
      url: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "URL",
        description: "An external resource with additional information.",
        type: "string",
        format: "uri",
      },
      uuid: {
        title: "UUID",
        description: "The unique identifier associated with every object.",
        comment: "Do not submit. The uuid is set by the server.",
        type: "string",
        format: "uuid",
        serverDefault: "uuid4",
        permission: "import_items",
        requestMethod: "POST",
      },
    },
  },

  Biosample: {
    title: "Biosample",
    $id: "/profiles/biosample.json",
    required: ["award", "lab", "source", "donors", "taxa", "biosample_term"],
    properties: {
      biosample_term: {
        title: "Biosample Term",
        description: "Ontology term identifying a biosample.",
        type: "string",
        linkTo: "SampleTerm",
      },
      donors: {
        title: "Donors",
        description: "Donor(s). Any contributing donor.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Donor",
          description: "Donor(s).",
          comment:
            "See concrete class human_donor.json or rodent_donor.json for available identifiers.",
          type: "string",
          linkTo: "Donor",
        },
      },
      embryonic: {
        title: "Embryonic",
        description: "Biosample is embryonic.",
        type: "boolean",
      },
    },
  },

  Document: {
    title: "Document",
    $id: "/profiles/document.json",
    required: ["document_type", "description", "attachment", "lab", "award"],
    identifyingProperties: ["uuid", "aliases"],
    properties: {
      attachment: {
        title: "Attachment",
        type: "object",
        additionalProperties: false,
        formInput: "file",
        attachment: true,
        properties: {
          download: {
            title: "File Name",
            type: "string",
          },
          href: {
            comment: "Internal webapp URL for document file",
            type: "string",
          },
          type: {
            title: "MIME type",
            type: "string",
            enum: [
              "application/json",
              "application/pdf",
              "image/gif",
              "image/jpeg",
              "image/png",
              "image/svs",
              "image/tiff",
              "text/autosql",
              "text/html",
              "text/plain",
              "text/tab-separated-values",
            ],
          },
          md5sum: {
            title: "MD5sum",
            type: "string",
            format: "md5sum",
          },
          size: {
            title: "File Size",
            type: "integer",
            minimum: 0,
          },
          width: {
            title: "Image Width",
            type: "integer",
            minimum: 0,
          },
          height: {
            title: "Image Height",
            type: "integer",
            minimum: 0,
          },
        },
      },
      urls: {
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "URL",
        description:
          "External resources with additional information to the document.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "URL",
          description:
            "An external resource with additional information to the document.",
          type: "string",
          format: "uri",
        },
      },
      submitted_by: {
        "rdfs:subPropertyOf": "dc:creator",
        title: "Submitted By",
        comment:
          "Do not submit. The user that created the object is assigned by the server.",
        type: "string",
        linkTo: "User",
        serverDefault: "userid",
        permission: "import_items",
      },
      documents: {
        title: "Documents",
        description:
          "Documents that provide additional information (not data file).",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Document",
          description:
            "A document that provides additional information (not data file).",
          type: "string",
          comment: "See document.json for available identifiers.",
          linkTo: "Document",
        },
      },
      "@id": {
        title: "ID",
        type: "string",
        notSubmittable: true,
      },
      "@type": {
        title: "Type",
        type: "array",
        items: {
          type: "string",
        },
        notSubmittable: true,
      },
    },
  },

  Gene: {
    title: "Gene",
    $id: "/profiles/gene.json",
    required: ["geneid", "symbol", "dbxrefs", "taxa"],
    identifyingProperties: ["uuid", "geneid", "aliases"],
    properties: {
      start: {
        title: "Start",
        description: "The starting coordinate.",
        type: "integer",
        minimum: 0,
      },
      locations: {
        title: "Gene Locations",
        description:
          "Gene locations specified using 1-based, closed coordinates for different versions of reference genome assemblies.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Gene Location",
          description:
            "Gene location specified using 1-based, closed coordinates for a specific version of the reference genome assembly.",
          type: "object",
          additionalProperties: false,
          required: ["assembly", "chromosome", "start", "end"],
          properties: {
            assembly: {
              title: "Mapping Assembly",
              description:
                "The genome assembly to which coordinates relate. e.g. GRCh38.",
              type: "string",
              enum: ["GRCh38", "hg19", "mm10", "mm9"],
            },
            chromosome: {
              title: "Chromosome",
              description:
                "The number (or letter) designation for the chromosome, e.g. chr1 or chrX",
              type: "string",
              pattern: "^(chr[0-9A-Za-z]+)$",
            },
            start: {
              title: "Start",
              description: "The starting coordinate.",
              type: "integer",
              minimum: 0,
            },
            end: {
              title: "End",
              description: "The ending coordinate.",
              type: "integer",
              minimum: 0,
            },
          },
        },
        permission: "import_items",
      },
      "@id": {
        title: "ID",
        type: "string",
        notSubmittable: true,
      },
      "@type": {
        title: "Type",
        type: "array",
        items: {
          type: "string",
        },
        notSubmittable: true,
      },
    },
  },

  HumanDonor: {
    title: "Human Donor",
    $id: "/profiles/human_donor.json",
    required: ["award", "lab", "taxa"],
    identifyingProperties: [
      "uuid",
      "accession",
      "alternate_accessions",
      "aliases",
    ],
    properties: {
      url: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "URL",
        description: "An external resource with additional information.",
        type: "string",
        format: "uri",
      },
      external_resources: {
        title: "External Resources",
        description: "A list of external resources associated with the donor.",
        type: "array",
        minItems: 1,
        uniqueItems: false,
        items: {
          title: "External Resource",
          description: "An external resource associated with the donor.",
          type: "object",
          required: ["resource_identifier", "resource_name"],
          additionalProperties: false,
          properties: {
            resource_name: {
              title: "External Resource Name",
              description: "Name of external resource.",
              type: "string",
            },
            resource_identifier: {
              title: "External Resource Identifier",
              description: "Identifier of external resource.",
              type: "string",
            },
            resource_url: {
              title: "External Resource URL",
              description: "URL for the external resource",
              type: "string",
            },
          },
        },
      },
      health_status_history: {
        title: "Health Status History",
        description: "Relevent health status changes in the donor",
        type: "array",
        minItems: 1,
        items: {
          title: "Health Status",
          type: "object",
          additionalProperties: false,
          properties: {
            health_description: {
              title: "Description of Donor Health",
              description: "Description of the health status change.",
              type: "string",
              pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
              formInput: "textarea",
            },
            date_start: {
              title: "Date Health Change Started",
              description: "The date the donor health change started.",
              type: "string",
              format: "date",
            },
            date_end: {
              title: "Date Health Change Ended",
              description:
                "The date the donor health change ended.  This value is not set if the health status is continuing, or if there is a following health status.",
              type: "string",
              format: "date",
            },
          },
        },
      },
      "@id": {
        title: "ID",
        type: "string",
        notSubmittable: true,
      },
      "@type": {
        title: "Type",
        type: "array",
        items: {
          type: "string",
        },
        notSubmittable: true,
      },
    },
  },

  Page: {
    title: "Page",
    $id: "/profiles/page.json",
    required: ["name", "title"],
    identifyingProperties: ["uuid", "name", "aliases"],
    properties: {
      parent: {
        title: "Parent Page",
        type: ["string", "null"],
        linkTo: "Page",
        validators: ["isNotCollectionDefaultPage"],
      },
      layout: {
        title: "Page Layout",
        description: "Hierarchical description of the page layout.",
        type: "object",
        additionalProperties: false,
        formInput: "layout",
        properties: {
          blocks: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                "@id": {
                  title: "Block ID",
                  description:
                    "Unique identifier for this blocUnique identifier for this block.",
                  type: "string",
                },
                "@type": {
                  title: "Block Type",
                  description:
                    "Indicates whether this block contains markdown or a component specification.",
                  type: "string",
                },
                body: {
                  title: "Block Body",
                  description: "The text content of this block.",
                  type: "string",
                },
                direction: {
                  title: "Direction",
                  description: "The text language direction -- ltr or rtl.",
                  type: "string",
                },
              },
            },
          },
        },
      },
      "@id": {
        title: "ID",
        type: "string",
        notSubmittable: true,
      },
      "@type": {
        title: "Type",
        type: "array",
        items: {
          type: "string",
        },
        notSubmittable: true,
      },
    },
  },

  WholeOrganism: {
    title: "Whole Organism",
    $id: "/profiles/whole_organism.json",
    required: ["award", "lab", "source", "donors", "taxa", "biosample_term"],
    properties: {
      "@id": {
        title: "ID",
        type: "string",
        notSubmittable: true,
      },
      "@type": {
        title: "Type",
        type: "array",
        items: {
          type: "string",
        },
        notSubmittable: true,
      },
      accession: {
        title: "Accession",
        type: "string",
        format: "accession",
      },
      embryonic: {
        title: "Embryonic",
        type: "boolean",
      },
    },
  },

  AnalysisSet: {
    title: "Analysis Set",
    $id: "/profiles/analysis_set.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    description: "Schema for an analysis set.",
    type: "object",
    required: ["award", "lab"],
    identifyingProperties: [
      "uuid",
      "accession",
      "alternate_accessions",
      "aliases",
    ],
    properties: {
      documents: {
        title: "Documents",
        description:
          "Documents that provide additional information (not data file).",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Document",
          description:
            "A document that provides additional information (not data file).",
          type: "string",
          comment: "See document.json for available identifiers.",
          linkTo: "Document",
        },
      },
      lab: {
        title: "Lab",
        description: "Lab associated with the submission.",
        comment: "Required. See lab.json for list of available identifiers.",
        type: "string",
        linkTo: "Lab",
        linkSubmitsFor: true,
      },
      award: {
        title: "Award",
        description: "Grant associated with the submission.",
        comment: "Required. See award.json for list of available identifiers.",
        type: "string",
        linkTo: "Award",
      },
      accession: {
        title: "Accession",
        description:
          "A unique identifier to be used to reference the object prefixed with IGVF.",
        comment: "Do not submit. The accession is assigned by the server.",
        type: "string",
        format: "accession",
        serverDefault: "accession",
        permission: "import_items",
        accessionType: "DS",
        readonly: true,
      },
      alternate_accessions: {
        title: "Alternate Accessions",
        description:
          "Accessions previously assigned to objects that have been merged with this object.",
        comment:
          "Do not submit. Only admins are allowed to set or update this value.",
        type: "array",
        minItems: 1,
        permission: "import_items",
        items: {
          title: "Alternate Accession",
          description:
            "An accession previously assigned to an object that has been merged with this object.",
          comment:
            "Only accessions of objects that have status equal replaced will work here.",
          type: "string",
          format: "accession",
        },
        readonly: true,
      },
      collections: {
        title: "Collections",
        description: "Some samples are part of particular data collections.",
        comment: "Do not submit. Collections are for DACC use only.",
        type: "array",
        minItems: 1,
        permission: "import_items",
        uniqueItems: true,
        items: {
          type: "string",
          enum: ["ENCODE"],
        },
        readonly: true,
      },
      status: {
        title: "Status",
        type: "string",
        permission: "import_items",
        default: "in progress",
        description: "The status of the metadata object.",
        comment:
          "Do not submit.  This is set by admins along the process of metadata submission.",
        enum: [
          "in progress",
          "released",
          "deleted",
          "replaced",
          "revoked",
          "archived",
        ],
        readonly: true,
      },
      revoke_detail: {
        title: "Revoke Detail",
        type: "string",
        permission: "import_items",
        description:
          "Explanation of why an object was transitioned to the revoked status.",
        comment:
          "Do not submit. This is set by admins when an object is revoked.",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
        formInput: "textarea",
        readonly: true,
      },
      schema_version: {
        title: "Schema Version",
        description:
          "The version of the JSON schema that the server uses to validate the object.",
        comment:
          "Do not submit. The version used to validate the object is set by the server. The default should be set to the current version.",
        type: "string",
        pattern: "^\\d+(\\.\\d+)*$",
        requestMethod: [],
        "hidden comment": "Bump the default in the subclasses.",
        default: "3",
      },
      uuid: {
        title: "UUID",
        description: "The unique identifier associated with every object.",
        comment: "Do not submit. The uuid is set by the server.",
        type: "string",
        format: "uuid",
        serverDefault: "uuid4",
        permission: "import_items",
        requestMethod: "POST",
        readonly: true,
      },
      notes: {
        title: "Notes",
        description: "DACC internal notes.",
        comment:
          "Do not submit. A place for the DACC to keep information that does not have a place in the schema.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
        permission: "import_items",
        formInput: "textarea",
        readonly: true,
      },
      aliases: {
        title: "Aliases",
        description: "Lab specific identifiers to reference an object.",
        comment:
          "The purpose of this field is to provide a link into the lab LIMS and to facilitate shared objects.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          uniqueKey: "alias",
          title: "Lab Alias",
          description: "A lab specific identifier to reference an object.",
          comment:
            "Current convention is colon separated lab name and lab identifier. (e.g. john-doe:42).",
          type: "string",
          pattern:
            "^(?:j-michael-cherry|ali-mortazavi|barbara-wold|lior-pachter|grant-macgregor|kim-green|mark-craven|qiongshi-lu|audrey-gasch|robert-steiner|jesse-engreitz|thomas-quertermous|anshul-kundaje|michael-bassik|will-greenleaf|marlene-rabinovitch|lars-steinmetz|jay-shendure|nadav-ahituv|martin-kircher|danwei-huangfu|michael-beer|anna-katerina-hadjantonakis|christina-leslie|alexander-rudensky|laura-donlin|hannah-carter|bing-ren|kyle-gaulton|maike-sander|charles-gersbach|gregory-crawford|tim-reddy|ansuman-satpathy|andrew-allen|gary-hon|nikhil-munshi|w-lee-kraus|lea-starita|doug-fowler|luca-pinello|guillaume-lettre|benhur-lee|daniel-bauer|richard-sherwood|benjamin-kleinstiver|marc-vidal|david-hill|frederick-roth|mikko-taipale|anne-carpenter|hyejung-won|karen-mohlke|michael-love|jason-buenrostro|bradley-bernstein|hilary-finucane|chongyuan-luo|noah-zaitlen|kathrin-plath|roy-wollman|jason-ernst|zhiping-weng|manuel-garber|xihong-lin|alan-boyle|ryan-mills|jie-liu|maureen-sartor|joshua-welch|stephen-montgomery|alexis-battle|livnat-jerby|jonathan-pritchard|predrag-radivojac|sean-mooney|harinder-singh|nidhi-sahni|jishnu-das|hao-wu|sreeram-kannan|hongjun-song|alkes-price|soumya-raychaudhuri|shamil-sunyaev|len-pennacchio|axel-visel|jill-moore|ting-wang|feng-yue|igvf|igvf-dacc):[a-zA-Z\\d_$.+!*,()'-]+(?:\\s[a-zA-Z\\d_$.+!*,()'-]+)*$",
        },
      },
      creation_timestamp: {
        "rdfs:subPropertyOf": "dc:created",
        title: "Creation Timestamp",
        description: "The date the object was created.",
        comment:
          "Do not submit. The date the object is created is assigned by the server.",
        type: "string",
        format: "date-time",
        serverDefault: "now",
        permission: "import_items",
        readonly: true,
      },
      submitted_by: {
        "rdfs:subPropertyOf": "dc:creator",
        title: "Submitted By",
        comment:
          "Do not submit. The user that created the object is assigned by the server.",
        type: "string",
        linkTo: "User",
        serverDefault: "userid",
        permission: "import_items",
        readonly: true,
      },
      submitter_comment: {
        title: "Submitter Comment",
        description:
          "Additional information specified by the submitter to be displayed as a comment on the portal.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
        formInput: "textarea",
      },
      description: {
        title: "Description",
        description: "A plain text description of the object.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$|^$",
        formInput: "textarea",
      },
      samples: {
        title: "Samples",
        description: "The sample(s) associated with this file set.",
        type: "array",
        uniqueItems: true,
        minItems: 1,
        items: {
          title: "Sample",
          description: "A sample associated with this file set.",
          comment: "See sample.json for available identifiers.",
          type: "string",
          linkTo: "Sample",
        },
      },
      donors: {
        title: "Donors",
        description: "The donor(s) associated with this file set.",
        type: "array",
        uniqueItems: true,
        minItems: 1,
        items: {
          title: "Donor",
          description: "A donor associated with this file set.",
          comment: "See donor.json for available identifiers.",
          type: "string",
          linkTo: "Donor",
        },
      },
      input_file_sets: {
        title: "Input File Sets",
        description:
          "The file set(s) to which any files used in this analysis set belong.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Input File Set",
          description:
            "A file set with files that are used in this analysis set.",
          type: "string",
          linkTo: "FileSet",
        },
      },
      "@id": {
        title: "ID",
        type: "string",
        notSubmittable: true,
      },
      "@type": {
        title: "Type",
        type: "array",
        items: {
          type: "string",
        },
        notSubmittable: true,
      },
      summary: {
        title: "Summary",
        type: "string",
        notSubmittable: true,
      },
      assay_title: {
        title: "Assay Title",
        description:
          "Title(s) of assays that produced data analyzed in the analysis set.",
        type: "array",
        uniqueItems: true,
        items: {
          title: "Assay Title",
          description:
            "Title of assay that produced data analyzed in the analysis set.",
          type: "string",
        },
        notSubmittable: true,
      },
    },
    boost_values: {
      "@type": 1,
    },
    changelog: "/profiles/changelogs/analysis_set.md",
    "@type": ["JSONSchema"],
  },
};

export default profiles;

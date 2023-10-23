/**
 * Holds schema profiles for Jest testing. Make sure to update these if relevant real schemas
 * change. Just copy the new versions from igvfd /profiles.
 */
const profiles = {
  Award: {
    title: "Grant",
    $id: "/profiles/award.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    required: ["name", "project", "title"],
    identifyingProperties: ["uuid", "name", "title", "aliases"],
    additionalProperties: false,
    mixinProperties: [
      {
        $ref: "mixins.json#/basic_item",
      },
      {
        $ref: "mixins.json#/url",
      },
      {
        $ref: "mixins.json#/shared_status",
      },
    ],
    type: "object",
    properties: {
      status: {
        title: "Status",
        type: "string",
        default: "current",
        enum: ["current", "deleted", "disabled"],
      },
      url: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "URL",
        description: "An external resource with additional information.",
        type: "string",
        format: "uri",
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
      title: {
        "rdfs:subPropertyOf": "dc:title",
        title: "Title",
        description: "The grant name from the NIH database, if applicable.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
      },
      name: {
        title: "Name",
        description:
          "The official grant number from the NIH database, if applicable",
        type: "string",
        pattern: "^[A-Za-z0-9\\-]+$",
        uniqueKey: true,
      },
      start_date: {
        title: "Start Date",
        comment: "Date can be submitted as YYYY-MM-DD.",
        type: "string",
        format: "date",
      },
      end_date: {
        title: "End Date",
        comment: "Date can be submitted as YYYY-MM-DD.",
        type: "string",
        format: "date",
      },
      pis: {
        title: "Principal Investigators",
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
      contact_pi: {
        title: "Contact P.I.",
        description: "The contact Principal Investigator of the grant.",
        type: "string",
        linkTo: "User",
      },
      project: {
        title: "Project",
        description:
          "The collection of biological data related to a single initiative, originating from a consortium.",
        type: "string",
        enum: ["community", "ENCODE", "IGVF"],
      },
      viewing_group: {
        title: "View Access Group",
        description:
          "The group that determines which set of data the user has permission to view.",
        type: "string",
        enum: ["community", "IGVF"],
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
    },
    boost_values: {
      name: 1,
      "@type": 1,
      title: 1,
      project: 1,
      component: 1,
    },
    changelog: "/profiles/changelogs/award.md",
    "@type": ["JSONSchema"],
  },

  AuxiliarySet: {
    title: "Auxiliary Set",
    $id: "/profiles/auxiliary_set.json",
    required: ["lab", "award", "file_set_type"],
    properties: {
      accession: {
        title: "Accession",
        type: "string",
      },
      alternate_accessions: {
        title: "Alternate Accessions",
        type: "array",
        items: {
          title: "Alternate Accession",
          type: "string",
        },
      },
      file_set_type: {
        title: "File Set Type",
        type: "string",
        enum: [
          "cell hashing",
          "circularized barcode detection",
          "gRNA sequencing",
          "oligo-conjugated lipids",
          "oligo-conjugated antibodies",
          "quantification barcode sequencing",
        ],
      },
      lab: {
        title: "Lab",
        type: "string",
        linkTo: "Lab",
      },
      status: {
        title: "Status",
        type: "string",
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
    },
  },

  Biosample: {
    title: "Biosample",
    $id: "/profiles/biosample.json",
    required: ["award", "lab", "source", "donors", "taxa", "sample_terms"],
    properties: {
      sample_terms: {
        title: "Sample Terms",
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

  ConstructLibrarySet: {
    title: "Construct Library Set",
    $id: "/profiles/construct_library_set.json",
    required: ["document_type", "description", "attachment", "lab", "award"],
    identifyingProperties: [
      "uuid",
      "aliases",
      "accession",
      "alternate_accessions",
    ],
    properties: {
      "@id": {
        title: "ID",
        type: "string",
      },
      accession: {
        title: "Accession",
        type: "string",
      },
      aliases: {
        title: "Aliases",
        type: "array",
      },
      expression_vector_library_details: {
        title: "Expression Vector Library Details",
        description:
          "Details about a construct library supplying specific gene(s) to be expressed in a sample.",
        type: "object",
      },
      guide_library_details: {
        title: "Guide Library Details",
        type: "object",
      },
      lab: {
        title: "Lab",
        type: "string",
      },
      loci: {
        title: "Loci",
        type: "array",
        items: {
          title: "Locus",
          type: "object",
          properties: {
            assembly: {
              title: "Mapping assembly",
              type: "string",
            },
            chromosome: {
              title: "Chromosome",
              type: "string",
            },
            start: {
              title: "Start",
              type: "integer",
            },
            end: {
              title: "End",
              type: "integer",
            },
          },
        },
      },
      reporter_library_details: {
        title: "Reporter Library Details",
        type: "object",
      },
      scope: {
        title: "Library Construct Scope",
        type: "string",
      },
      selection_criteria: {
        title: "Selection Criteria",
        type: "array",
      },
      status: {
        title: "Status",
        type: "string",
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
      ethnicities: {
        title: "Ethnicity",
        type: "array",
        items: {
          type: "string",
        },
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
      sex: {
        title: "Sex",
        type: "string",
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

  InVitroSystem: {
    title: "In Vitro System",
    $id: "/profiles/in_vitro_system.json",
    required: [
      "award",
      "lab",
      "source",
      "donors",
      "sample_terms",
      "classification",
    ],
    identifyingProperties: [
      "uuid",
      "accession",
      "alternate_accessions",
      "aliases",
    ],
    properties: {
      "@id": {
        title: "ID",
        type: "string",
      },
      accession: {
        title: "Accession",
        type: "string",
      },
      introduced_factors: {
        title: "Introduced Factors",
        type: "array",
        items: {
          title: "Treatment",
          type: "string",
          linkTo: "Treatment",
        },
      },
      lab: {
        title: "Lab",
        type: "string",
        linkTo: "Lab",
      },
      sample_terms: {
        title: "Sample Terms",
        type: "array",
        items: {
          title: "Sample Term",
          type: "string",
          linkTo: "SampleTerm",
        },
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

  MultiplexedSample: {
    title: "Multiplexed Sample",
    $id: "/profiles/multiplexed_sample.json",
    required: ["award", "lab", "multiplexed_samples"],
    properties: {
      accession: {
        title: "Accession",
        type: "string",
      },
      alternate_accessions: {
        title: "Alternate Accessions",
        type: "array",
        items: {
          title: "Alternate Accession",
          type: "string",
        },
      },
      lab: {
        title: "Lab",
        type: "string",
        linkTo: "Lab",
      },
      status: {
        title: "Status",
        type: "string",
        enum: [
          "in progress",
          "released",
          "deleted",
          "replaced",
          "revoked",
          "archived",
        ],
      },
      summary: {
        title: "Summary",
        type: "string",
      },
    },
  },

  ReferenceFile: {
    title: "Reference File",
    $id: "/profiles/reference_file.json",
    required: [
      "award",
      "lab",
      "md5sum",
      "file_format",
      "file_set",
      "content_type",
    ],
    identifyingProperties: [
      "uuid",
      "accession",
      "alternate_accessions",
      "aliases",
      "md5sum",
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
        accessionType: "FI",
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
        default: "2",
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
      content_md5sum: {
        title: "Content MD5sum",
        description: "The MD5sum of the uncompressed file.",
        type: "string",
        permission: "import_items",
        format: "hex",
        maxLength: 32,
        pattern: "[a-f\\d]{32}|[A-F\\d]{32}",
        readonly: true,
      },
      content_type: {
        title: "Content Type",
        description: "The type of content in the file.",
        comment:
          "Content Type describes the content of the file. Genome reference are composite nucleic acid sequences assembled from the sequence of several different individual organisms representing the species. Guide RNA sequences are sequences of RNA molecules used in assays involving CRISPR editing. Sequence barcodes are lists of barcodes found in the sequencing library. Spike-ins are nucleic acid fragments of known sequence and quantity used for calibration in high-throughput sequencing. Transcriptome references are transcriptomic sequences of an idealized representative individual in a species. Vector sequences are sequences tested in MPRAs.",
        type: "string",
        enum: [
          "exclusion list",
          "genome reference",
          "guide RNA sequences",
          "inclusion list",
          "sequence barcodes",
          "spike-ins",
          "transcriptome reference",
          "vector sequences",
        ],
      },
      dbxrefs: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "External Resources",
        description:
          "Identifiers from external resources that may have 1-to-1 or 1-to-many relationships with IGVF file objects.",
        comment:
          "This property is overwritten by the subclasses to define specific enum values.",
        type: "array",
        uniqueItems: true,
        items: {
          title: "External identifier",
          description:
            "Identifier from an external resource that may have 1-to-1 or 1-to-many relationships with IGVF file objects.",
          type: "string",
          pattern: "^$",
        },
      },
      derived_from: {
        title: "Derived From",
        description:
          "The files participating as inputs into software to produce this output file.",
        type: "array",
        uniqueItems: true,
        items: {
          comment: "See file.json for a list of available identifiers.",
          type: "string",
          linkTo: "File",
        },
      },
      file_format: {
        title: "File Format",
        description: "The file format or extension of the file.",
        comment:
          "This property is overwritten by the subclasses to define specific enum values.",
        type: "string",
        enum: ["fasta", "gtf", "tar", "txt"],
      },
      file_format_specifications: {
        title: "File Format Specifications Documents",
        description: "Document that further explains the file format.",
        type: "array",
        uniqueItems: true,
        items: {
          comment: "See document.json for a list of available identifiers.",
          type: "string",
          linkTo: "Document",
        },
      },
      file_set: {
        title: "File Set",
        description: "The file set that this file belongs to.",
        comment: "See file_set.json for a list of available identifiers.",
        type: "string",
        linkTo: "FileSet",
      },
      file_size: {
        title: "File Size",
        description: "File size specified in bytes.",
        comment:
          "Do not submit. This value is calculated by the checkfiles script upon submission.",
        permission: "import_items",
        type: "integer",
        minimum: 0,
        readonly: true,
      },
      md5sum: {
        title: "MD5sum",
        description: "The md5sum of the file being transferred.",
        type: "string",
        format: "hex",
        maxLength: 32,
        pattern: "[a-f\\d]{32}|[A-F\\d]{32}",
      },
      submitted_file_name: {
        title: "Submitted File Name",
        description: "Original name of the file.",
        type: "string",
      },
      upload_status: {
        title: "Upload Status",
        description: "The upload/validation status of the file.",
        type: "string",
        default: "pending",
        permission: "import_items",
        enum: ["pending", "file not found", "invalidated", "validated"],
        readonly: true,
      },
      validation_error_detail: {
        title: "Validation Error Detail",
        description:
          "Explanation of why the file failed the automated content checks.",
        type: "string",
        permission: "import_items",
        readonly: true,
      },
      assembly: {
        title: "Genome Assembly",
        description: "Genome assembly applicable for the reference data.",
        type: "string",
        enum: ["GRCh38", "hg19", "GRCm39", "mm10"],
      },
      source: {
        title: "Source",
        description:
          "Link to external resource, such as NCBI or GENCODE, where the reference data was obtained.",
        type: "string",
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
      href: {
        title: "Download URL",
        description: "The download path to obtain file.",
        comment: "Do not submit. This is issued by the server.",
        type: "string",
        notSubmittable: true,
      },
      upload_credentials: {
        title: "Upload Credentials",
        description:
          "The upload credentials for S3 to submit the file content.",
        comment: "Do not submit. This is issued by the server.",
        type: "object",
        notSubmittable: true,
      },
    },
  },

  SequenceFile: {
    title: "Sequence File",
    $id: "/profiles/sequence_file.json",
    required: [
      "award",
      "lab",
      "md5sum",
      "file_format",
      "file_set",
      "content_type",
      "sequencing_run",
    ],
    identifyingProperties: [
      "uuid",
      "accession",
      "alternate_accessions",
      "aliases",
      "md5sum",
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
        accessionType: "FI",
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
        default: "2",
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
      content_md5sum: {
        title: "Content MD5sum",
        description: "The MD5sum of the uncompressed file.",
        type: "string",
        permission: "import_items",
        format: "hex",
        maxLength: 32,
        pattern: "[a-f\\d]{32}|[A-F\\d]{32}",
        readonly: true,
      },
      content_type: {
        title: "Content Type",
        description: "The type of content in the file.",
        comment:
          "Content Type describes the content of the file. Reads are individual sequences of bases corresponding to DNA or RNA fragments in a FASTQ text file format. Subreads are sequences of bases produced using PacBio platforms.",
        type: "string",
        enum: ["reads", "subreads"],
      },
      dbxrefs: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "External Resources",
        description:
          "Identifiers from external resources that may have 1-to-1 or 1-to-many relationships with IGVF file objects.",
        comment:
          "This property is overwritten by the subclasses to define specific enum values.",
        type: "array",
        uniqueItems: true,
        items: {
          title: "External identifier",
          description:
            "Identifier from an external resource that may have 1-to-1 or 1-to-many relationships with IGVF file objects.",
          type: "string",
          pattern: "^(SRA:(SRR|SRX)\\d+)$",
        },
      },
      derived_from: {
        title: "Derived From",
        description:
          "The files participating as inputs into software to produce this output file.",
        type: "array",
        uniqueItems: true,
        items: {
          comment: "See file.json for a list of available identifiers.",
          type: "string",
          linkTo: "File",
        },
      },
      file_format: {
        title: "File Format",
        description: "The file format or extension of the file.",
        comment:
          "This property is overwritten by the subclasses to define specific enum values.",
        type: "string",
        enum: ["bam", "fastq"],
      },
      file_format_specifications: {
        title: "File Format Specifications Documents",
        description: "Document that further explains the file format.",
        type: "array",
        uniqueItems: true,
        items: {
          comment: "See document.json for a list of available identifiers.",
          type: "string",
          linkTo: "Document",
        },
      },
      file_set: {
        title: "File Set",
        description: "The file set that this file belongs to.",
        comment: "See file_set.json for a list of available identifiers.",
        type: "string",
        linkTo: "FileSet",
      },
      file_size: {
        title: "File Size",
        description: "File size specified in bytes.",
        comment:
          "Do not submit. This value is calculated by the checkfiles script upon submission.",
        permission: "import_items",
        type: "integer",
        minimum: 0,
        readonly: true,
      },
      md5sum: {
        title: "MD5sum",
        description: "The md5sum of the file being transferred.",
        type: "string",
        format: "hex",
        maxLength: 32,
        pattern: "[a-f\\d]{32}|[A-F\\d]{32}",
      },
      submitted_file_name: {
        title: "Submitted File Name",
        description: "Original name of the file.",
        type: "string",
      },
      upload_status: {
        title: "Upload Status",
        description: "The upload/validation status of the file.",
        type: "string",
        default: "pending",
        permission: "import_items",
        enum: ["pending", "file not found", "invalidated", "validated"],
        readonly: true,
      },
      validation_error_detail: {
        title: "Validation Error Detail",
        description:
          "Explanation of why the file failed the automated content checks.",
        type: "string",
        permission: "import_items",
        readonly: true,
      },
      read_count: {
        title: "Read Count",
        description: "Number of reads in a fastq file.",
        comment:
          "Do not submit. This value is calculated by the checkfiles script upon submission.",
        permission: "import_items",
        type: "integer",
        minimum: 0,
        readonly: true,
      },
      minimum_read_length: {
        title: "Minimum Read Length",
        description:
          "For high-throughput sequencing, the minimum number of contiguous nucleotides determined by sequencing.",
        comment:
          "Do not submit. This value is calculated by the checkfiles script upon submission.",
        permission: "import_items",
        type: "integer",
        minimum: 0,
        readonly: true,
      },
      maximum_read_length: {
        title: "Read Length",
        description:
          "For high-throughput sequencing, the maximum number of contiguous nucleotides determined by sequencing.",
        comment:
          "Do not submit. This value is calculated by the checkfiles script upon submission.",
        permission: "import_items",
        type: "integer",
        minimum: 0,
        readonly: true,
      },
      mean_read_length: {
        title: "Read Length",
        description:
          "For high-throughput sequencing, the mean number of contiguous nucleotides determined by sequencing.",
        comment:
          "Do not submit. This value is calculated by the checkfiles script upon submission.",
        permission: "import_items",
        type: "integer",
        minimum: 0,
        readonly: true,
      },
      sequencing_run: {
        title: "Sequencing Run",
        description:
          "An ordinal number indicating which sequencing run of the associated library that the file belongs to.",
        type: "integer",
        minimum: 1,
      },
      illumina_read_type: {
        title: "Illumina Read Type",
        description:
          "The read type of the file. Relevant only for files produced using an Illumina sequencing platform.",
        type: "string",
        enum: ["R1", "R2", "R3", "I1", "I2"],
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
      href: {
        title: "Download URL",
        description: "The download path to obtain file.",
        comment: "Do not submit. This is issued by the server.",
        type: "string",
        notSubmittable: true,
      },
      upload_credentials: {
        title: "Upload Credentials",
        description:
          "The upload credentials for S3 to submit the file content.",
        comment: "Do not submit. This is issued by the server.",
        type: "object",
        notSubmittable: true,
      },
    },
  },

  AnalysisSet: {
    title: "Analysis Set",
    $id: "/profiles/analysis_set.json",
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
  },

  CuratedSet: {
    title: "CuratedSet",
    description:
      "Schema for submitting a file set for files originating from external sources.",
    $id: "/profiles/curated_set.json",
    required: ["lab", "award", "curated_set_type"],
    identifyingProperties: ["uuid", "aliases"],
    properties: {
      taxa: {
        title: "Taxa",
        type: "string",
        enum: ["Homo sapiens", "Mus musculus", "Saccharomyces"],
      },
      publication_identifiers: {
        title: "References",
        description:
          "The publication identifiers that provide more information about the object.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Reference",
          description:
            "A reference that provide smore information about the object.",
          type: "string",
          pattern:
            "^(PMID:[0-9]+|doi:10\\.[0-9]{4}[\\d\\s\\S\\:\\.\\/]+|PMCID:PMC[0-9]+|[0-9]{4}\\.[0-9]{4})$",
        },
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
      url: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "URL",
        description: "An external resource with additional information.",
        type: "string",
        format: "uri",
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
      curated_set_type: {
        title: "Curated Set Type",
        description: "The category that best describes this curated file set.",
        type: "string",
        enum: ["genome", "transcriptome", "elements", "variants", "genes"],
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
    },
  },

  MeasurementSet: {
    title: "Measurement Set",
    $id: "/profiles/measurement_set.json",
    required: ["award", "lab", "assay_term"],
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
      assay_term: {
        title: "Assay Term",
        description: "The assay used to produce data in this measurement set.",
        comment: "See assay_term.json for available identifiers.",
        type: "string",
        linkTo: "AssayTerm",
      },
      protocol: {
        title: "Protocol",
        description:
          "Link to the protocol for conducting the assay on Protocols.io.",
        type: "string",
        pattern: "^https://www\\.protocols\\.io/(\\S*)$",
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
    },
  },

  Software: {
    title: "Software",
    description: "Schema for submitting a software object.",
    $id: "/profiles/software.json",
    identifyingProperties: ["uuid", "aliases", "name"],
    properties: {
      publication_identifiers: {
        title: "References",
        description:
          "The publication identifiers that provide more information about the object.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Reference",
          description:
            "A reference that provide smore information about the object.",
          type: "string",
          pattern:
            "^(PMID:[0-9]+|doi:10\\.[0-9]{4}[\\d\\s\\S\\:\\.\\/]+|PMCID:PMC[0-9]+|[0-9]{4}\\.[0-9]{4})$",
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
      status: {
        title: "Status",
        type: "string",
        default: "in progress",
        permission: "import_items",
        enum: ["deleted", "in progress", "released"],
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
        default: "1",
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
      name: {
        title: "Name",
        description:
          "Unique name of the software package; a lowercase version of the title.",
        type: "string",
        pattern: "^[a-z0-9\\-\\_]+",
        uniqueKey: "software:name",
      },
      title: {
        title: "Title",
        description: "The preferred viewable name of the software.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
      },
      source_url: {
        title: "Source URL",
        description: "An external resource to the codebase.",
        type: "string",
        format: "uri",
      },
      used_by: {
        title: "Used by",
        type: "array",
        uniqueItems: true,
        items: {
          title: "Used by",
          type: "string",
          enum: ["consortium analysis", "DACC", "processing pipelines"],
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
      versions: {
        title: "Versions",
        type: "array",
        notSubmittable: true,
        items: {
          type: "string",
          linkTo: "SoftwareVersion",
        },
      },
    },
  },

  SoftwareVersion: {
    title: "Software version",
    description: "Schema for submitting a tagged version of a software object.",
    $id: "/profiles/software_version.json",

    identifyingProperties: ["uuid", "aliases", "software.name-version"],

    properties: {
      publication_identifiers: {
        title: "References",
        description:
          "The publication identifiers that provide more information about the object.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Reference",
          description:
            "A reference that provide smore information about the object.",
          type: "string",
          pattern:
            "^(PMID:[0-9]+|doi:10\\.[0-9]{4}[\\d\\s\\S\\:\\.\\/]+|PMCID:PMC[0-9]+|[0-9]{4}\\.[0-9]{4})$",
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
      status: {
        title: "Status",
        type: "string",
        default: "in progress",
        permission: "import_items",
        enum: ["deleted", "in progress", "released"],
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
        default: "1",
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
      notes: {
        title: "Notes",
        description: "DACC internal notes.",
        comment:
          "Do not submit. A place for the DACC to keep information that does not have a place in the schema.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
        permission: "import_items",
        formInput: "textarea",
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
      software: {
        title: "Software",
        description: "Unique name of the software package.",
        comment: "See software.json for available identifiers.",
        type: "string",
        linkTo: "Software",
      },
      version: {
        title: "Version",
        description: "The version of a particular software.",
        comment: "A string to identify a specific version of the software.",
        type: "string",
        pattern: "^[0-9].*",
      },
      download_id: {
        title: "Download ID",
        description:
          "The MD5 checksum, SHA-1 commit ID, image hash, or similar permanent identifier of the particular version of software used.",
        comment:
          "Prefer SHA-1 of commit ID if available, otherwise use md5sum of downloaded software.",
        type: "string",
        format: "hex",
      },
      downloaded_url: {
        title: "Download URL",
        description:
          "An external resource to track the version of the software downloaded.",
        type: "string",
        format: "uri",
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
      name: {
        title: "Name",
        type: "string",
        notSubmittable: true,
      },
    },
  },

  Biomarker: {
    title: "Biomarker",
    description: "Schema for submitting a biomarker.",
    $id: "/profiles/biomarker.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    required: ["name", "quantification", "award", "lab"],
    identifyingProperties: ["uuid", "name_quantification", "aliases"],
    properties: {
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
      schema_version: {
        title: "Schema Version",
        description:
          "The version of the JSON schema that the server uses to validate the object.",
        comment:
          "Do not submit. The version used to validate the object is set by the server. The default should be set to the current version.",
        type: "string",
        pattern: "^\\d+(\\.\\d+)*$",
        requestMethod: [],
        default: "1",
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
      name: {
        title: "Name",
        description: "The biomarker name.",
        comment: "Only admins are allowed to set this value.",
        type: "string",
        permission: "import_items",
        readonly: true,
      },
      classification: {
        title: "Classification",
        description: "Sample specific biomarker.",
        type: "string",
        enum: ["cell surface protein", "marker gene"],
      },
      quantification: {
        title: "Quantification",
        description:
          "The biomarker association to the biosample, disease or other condition.  This can be the absence of the biomarker or the presence of the biomarker in some low, intermediate or high quantity.",
        comment: "Only admins are allowed to set this value.",
        type: "string",
        enum: ["negative", "positive", "low", "intermediate", "high"],
        permission: "import_items",
        readonly: true,
      },
      synonyms: {
        title: "Synonyms",
        description: "Alternate names for this biomarker.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          type: "string",
        },
      },
      gene: {
        title: "Gene",
        description: "Biomarker gene.",
        type: "string",
        linkTo: "Gene",
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
      name_quantification: {
        title: "Name and Quantification",
        type: "string",
        notSubmittable: true,
      },
    },
  },

  Source: {
    title: "Source",
    description: "Schema for submitting an originating lab or vendor.",
    $id: "/profiles/source.json",
    identifyingProperties: ["uuid", "name", "aliases"],
    properties: {
      status: {
        title: "Status",
        type: "string",
        default: "in progress",
        permission: "import_items",
        enum: ["deleted", "in progress", "released"],
      },
      url: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "URL",
        description: "An external resource with additional information.",
        type: "string",
        format: "uri",
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
        default: "2",
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
      notes: {
        title: "Notes",
        description: "DACC internal notes.",
        comment:
          "Do not submit. A place for the DACC to keep information that does not have a place in the schema.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
        permission: "import_items",
        formInput: "textarea",
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
      title: {
        title: "Title",
        description: "The complete name of the originating lab or vendor.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
      },
      name: {
        title: "Name",
        comment:
          "A short unique name for the source, current convention is lowercase and hyphen-delimited version of title (e.g. john-doe).",
        type: "string",
        pattern: "^[a-z0-9\\-]+$",
        uniqueKey: true,
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
    },
  },

  Publication: {
    title: "Publication",
    description: "Schema for a publication object.",
    $id: "/profiles/publication.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    required: ["title", "award", "lab", "identifiers"],
    identifyingProperties: ["uuid", "title", "aliases"],
    properties: {
      status: {
        title: "Status",
        type: "string",
        default: "in progress",
        permission: "import_items",
        enum: ["deleted", "in progress", "released"],
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
      schema_version: {
        title: "Schema Version",
        description:
          "The version of the JSON schema that the server uses to validate the object.",
        comment:
          "Do not submit. The version used to validate the object is set by the server. The default should be set to the current version.",
        type: "string",
        pattern: "^\\d+(\\.\\d+)*$",
        requestMethod: [],
        default: "2",
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
      notes: {
        title: "Notes",
        description: "DACC internal notes.",
        comment:
          "Do not submit. A place for the DACC to keep information that does not have a place in the schema.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
        permission: "import_items",
        formInput: "textarea",
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
      title: {
        title: "Title",
        description: "Title of the publication or communication.",
        uniqueKey: true,
        type: "string",
      },
      abstract: {
        title: "Abstract",
        description: "Abstract of the publication or communication.",
        type: "string",
      },
      authors: {
        title: "Authors",
        type: "string",
      },
      date_published: {
        title: "Publication Date",
        description:
          "The date the publication or communication was published; must be in YYYY-MM-DD format.",
        type: "string",
        format: "date",
      },
      date_revised: {
        title: "Date Revised",
        type: "string",
        format: "date",
      },
      issue: {
        title: "Issue",
        description: "The issue of the publication.",
        type: "string",
      },
      page: {
        title: "Page",
        description: "Pagination of the reference",
        type: "string",
      },
      volume: {
        title: "Volume",
        description: "The volume of the publication.",
        type: "string",
      },
      journal: {
        title: "Journal",
        description: "The journal of the publication.",
        type: "string",
      },
      identifiers: {
        title: "Identifiers",
        description: "The identifiers that reference data found in the object.",
        type: "array",
        uniqueItems: true,
        minItems: 1,
        items: {
          title: "Identifier",
          description:
            "An identifier that references data found in the object.",
          type: "string",
          uniqueKey: "publication:identifier",
          pattern:
            "^(PMID:[0-9]+|doi:10\\.[0-9]{4}[\\d\\s\\S\\:\\.\\/]+|PMCID:PMC[0-9]+|[0-9]{4}\\.[0-9]{4})$",
        },
      },
      published_by: {
        title: "Published By",
        type: "array",
        uniqueItems: true,
        default: ["IGVF"],
        items: {
          title: "Published By",
          type: "string",
          enum: ["community", "IGVF", "ENCODE"],
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
      publication_year: {
        title: "Publication Year",
        type: "integer",
        notSubmittable: true,
      },
    },
  },

  WholeOrganism: {
    title: "Whole Organism",
    $id: "/profiles/whole_organism.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    description: "Schema for submiting a whole organism sample.",
    type: "object",
    required: ["award", "lab", "source", "donors", "taxa", "sample_terms"],
    identifyingProperties: [
      "uuid",
      "accession",
      "alternate_accessions",
      "aliases",
    ],
    properties: {
      taxa: {
        title: "Taxa",
        type: "string",
        enum: ["Homo sapiens", "Mus musculus", "Saccharomyces"],
      },
      publication_identifiers: {
        title: "References",
        description:
          "The publication identifiers that provide more information about the object.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Reference",
          description:
            "A reference that provide smore information about the object.",
          type: "string",
          pattern:
            "^(PMID:[0-9]+|doi:10\\.[0-9]{4}[\\d\\s\\S\\:\\.\\/]+|PMCID:PMC[0-9]+|[0-9]{4}\\.[0-9]{4})$",
        },
      },
      url: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "URL",
        description: "An external resource with additional information.",
        type: "string",
        format: "uri",
      },
      source: {
        title: "Source",
        description: "The originating lab or vendor.",
        comment: "See source.json for available identifiers.",
        type: "string",
        linkTo: ["Source", "Lab"],
      },
      lot_id: {
        title: "Lot ID",
        description:
          "The lot identifier provided by the originating lab or vendor.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
      },
      product_id: {
        title: "Product ID",
        description:
          "The product identifier provided by the originating lab or vendor.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
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
        accessionType: "SM",
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
        default: "8",
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
      notes: {
        title: "Notes",
        description: "DACC internal notes.",
        comment:
          "Do not submit. A place for the DACC to keep information that does not have a place in the schema.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
        permission: "import_items",
        formInput: "textarea",
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
      lower_bound_age: {
        title: "Lower Bound Age",
        description:
          "Lower bound of age of the organism at the time of collection of the sample.",
        comment:
          "For samples from human donors older than 89 years, the lower bound of age has to be 90 and upper bound has to be 90, for de-identification purposes.",
        type: "number",
      },
      upper_bound_age: {
        title: "Upper Bound Age",
        description:
          "Upper bound of age of the organism at the time of collection of the sample.",
        comment:
          "For samples from human donors older than 89 years, the lower bound of age has to be 90 and upper bound has to be 90, for de-identification purposes.",
        type: "number",
      },
      age_units: {
        title: "Age Units",
        description: "The units of time associated with age of the biosample.",
        type: "string",
        enum: ["minute", "hour", "day", "week", "month", "year"],
      },
      sample_terms: {
        title: "Sample Terms",
        description: "Ontology term identifying a biosample.",
        type: "string",
        linkTo: "SampleTerm",
      },
      disease_terms: {
        title: "Disease Terms",
        description:
          "Ontology term of the disease associated with the biosample.",
        comment:
          "This property should only be used to submit existing known diseases, and not any phenotypic trait.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Disease Term",
          comment: "See phenotype_term.json for available identifiers.",
          type: "string",
          linkTo: "PhenotypeTerm",
        },
      },
      nih_institutional_certification: {
        type: "string",
        title: "NIH Institutional Certification",
        description:
          "Institutional certification given by the NIH for human biosamples.",
        comment: "Required for IGVF human biosamples.",
        pattern: "^NIC[A-Z0-9]+$",
      },
      pooled_from: {
        title: "Biosample(s) Pooled From",
        description: "The biosample(s) this biosample is pooled from.",
        type: "array",
        uniqueItems: true,
        minItems: 2,
        items: {
          title: "Biosample",
          description: "Biosample(s).",
          comment: "See biosample.json for available identifiers.",
          type: "string",
          linkTo: "Biosample",
        },
      },
      part_of: {
        title: "Part of Biosample",
        description:
          "Links to a biosample which represents a larger sample from which this sample was taken regardless of whether it is a tissue taken from an organism or smaller slices of a piece of tissue or aliquots of a cell growth.",
        comment:
          "For other specific relationships such as differentiation or hosting there are separate properties.",
        type: "string",
        linkTo: "Biosample",
      },
      treatments: {
        title: "Treatments",
        description: "A list of treatments applied to the biosample.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Treatment",
          comment: "See treatment.json for available identifiers.",
          type: "string",
          linkTo: "Treatment",
        },
      },
      donors: {
        title: "Donors",
        description: "Donor(s) the sample was derived from.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Donor",
          description: "Donor.",
          comment:
            "See concrete class human_donor.json or rodent_donor.json for available identifiers.",
          type: "string",
          linkTo: "Donor",
        },
      },
      biomarkers: {
        title: "Biomarkers",
        description: "Biological markers that are associated with this sample.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Biomarker",
          description: "Associated biomarker.",
          type: "string",
          linkTo: "Biomarker",
        },
      },
      embryonic: {
        title: "Embryonic",
        description: "Biosample is embryonic.",
        type: "boolean",
      },
      starting_amount: {
        title: "Starting Amount",
        description: "The initial quantity of samples obtained.",
        type: "number",
        minimum: 0,
      },
      starting_amount_units: {
        title: "Starting Amount Units",
        description:
          "The units used to quantify the amount of samples obtained.",
        type: "string",
        enum: [
          "cells",
          "cells/ml",
          "g",
          "items",
          "mg",
          "whole animals",
          "whole embryos",
          "μg",
          "ng",
        ],
      },
      dbxrefs: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "External Resources",
        description:
          "Biosample identifiers from external resources, such as Biosample database or Cellosaurus.",
        comment:
          "Do not submit. DCC personnel is responsible for submission of biosample external resource identifiers.",
        permission: "import_items",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "External Identifier",
          description: "An identifier from external resource.",
          type: "string",
          pattern: "^((GEO:SAMN\\d+)|(Cellosaurus:CVCL_\\w{4}))$",
        },
      },
      date_obtained: {
        title: "Date Obtained",
        description:
          "The date the sample was harvested, dissected or created, depending on the type of the sample.",
        comment: "Date should be submitted in as YYYY-MM-DD.",
        type: "string",
        format: "date",
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
      file_sets: {
        title: "File Sets",
        type: "array",
        items: {
          type: ["string", "object"],
          linkFrom: "FileSet.samples",
        },
      },
      sex: {
        title: "Sex",
        type: "string",
        enum: ["female", "male", "mixed", "unspecified"],
        notSubmittable: true,
      },
      age: {
        title: "Age",
        description: "Age of organism at the time of collection of the sample.",
        type: "string",
        pattern:
          "^((\\d+(\\.[1-9])?(\\-\\d+(\\.[1-9])?)?)|(unknown)|([1-8]?\\d)|(90 or above))$",
        notSubmittable: true,
      },
    },
    boost_values: {
      accession: 1,
      "@type": 1,
      taxa: 1,
    },
    changelog: "/profiles/changelogs/whole_organism.md",
    "@type": ["JSONSchema"],
  },

  Treatment: {
    title: "Treatment",
    $id: "/profiles/treatment.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    required: [
      "amount",
      "amount_units",
      "treatment_term_id",
      "treatment_term_name",
      "treatment_type",
      "purpose",
    ],
    identifyingProperties: ["uuid", "aliases"],
    additionalProperties: false,
    mixinProperties: [
      {
        $ref: "mixins.json#/basic_item",
      },
      {
        $ref: "mixins.json#/standard_status",
      },
      {
        $ref: "mixins.json#/documents",
      },
      {
        $ref: "mixins.json#/product_info",
      },
    ],
    dependentSchemas: {
      duration: {
        required: ["duration_units"],
        comment: "duration_units must be specified if duration is specified",
      },
      duration_units: {
        required: ["duration"],
        comment: "duration must be specified if duration_units is specified",
      },
      post_treatment_time: {
        required: ["post_treatment_time_units"],
        comment:
          "post_treatment_time_units must be specified if post_treatment_time is specified",
      },
      post_treatment_time_units: {
        required: ["post_treatment_time"],
        comment:
          "post_treatment_time must be specified if post_treatment_time_units is specified",
      },
      temperature: {
        required: ["temperature_units"],
        comment:
          "temperature_units must be specified if temperature is specified",
      },
      temperature_units: {
        required: ["temperature"],
        comment:
          "temperature must be specified if temperature_units is specified",
      },
      treatment_term_id: {
        oneOf: [
          {
            properties: {
              treatment_type: {
                enum: ["protein"],
              },
              treatment_term_id: {
                pattern: "^((UniProtKB:[A-Z0-9]{6})|(NTR:[0-9]{2,8}))$",
              },
            },
          },
          {
            properties: {
              treatment_type: {
                enum: ["chemical"],
              },
              treatment_term_id: {
                pattern: "^((CHEBI:[0-9]{1,7})|(NTR:[0-9]{2,8}))$",
              },
            },
          },
        ],
        comment:
          "If treatment_type is protein, only Uniprot ids are allowed while if treatment_type is chemical, only CHEBI ids are allowed. NTRs are allowed in special cases for both",
      },
    },
    properties: {
      source: {
        title: "Source",
        description: "The originating lab or vendor.",
        comment: "See source.json for available identifiers.",
        type: "string",
        linkTo: ["Source", "Lab"],
      },
      lot_id: {
        title: "Lot ID",
        description:
          "The lot identifier provided by the originating lab or vendor.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
      },
      product_id: {
        title: "Product ID",
        description:
          "The product identifier provided by the originating lab or vendor.",
        type: "string",
        pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
      },
      documents: {
        title: "Documents",
        description: "Documents that describe the treatment protocol details.",
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
      status: {
        title: "Status",
        type: "string",
        default: "in progress",
        permission: "import_items",
        enum: ["deleted", "in progress", "released"],
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
      amount: {
        title: "Amount",
        type: "number",
        description:
          "Specific quantity of the applied treatment (used in conjunction with amount_units).",
        comment: "amount must be specified if amount_units is specified",
      },
      amount_units: {
        title: "Amount Units",
        type: "string",
        enum: [
          "mg/kg",
          "mg/mL",
          "mM",
          "ng/mL",
          "nM",
          "percent",
          "μg/kg",
          "μg/kg",
          "μg/mL",
          "μM",
        ],
        comment: "amount_units must be specified if amount is specified",
      },
      duration: {
        title: "Duration",
        type: "number",
        description:
          "Duration indicates the time elapsed between the start and end of the treatment.",
        comment: "duration must be specified if duration_units is specified",
      },
      duration_units: {
        title: "Duration Units",
        type: "string",
        enum: ["second", "minute", "hour", "day"],
        comment: "duration_units must be specified if duration is specified",
      },
      pH: {
        title: "pH",
        type: "number",
        description:
          "Final pH of the solution containing a chemical compound (if applicable)",
      },
      purpose: {
        title: "Purpose",
        type: "string",
        enum: [
          "activation",
          "agonist",
          "antagonist",
          "control",
          "differentiation",
          "de-differentiation",
          "perturbation",
          "selection",
          "stimulation",
        ],
        description:
          "The intended purpose for treating the samples; Activation: treatment is known to activate a pathway in the biosample; Agonist: a substance which is known to initiate a physiological response when combined with a receptor; Antagonist: a substance that is known to interfere with or inhibits the physiological action of another; Control: treatment applied to a sample for control purposes; Differentiation: treatment that is applied to convert a less specialized cell to a more specialized cell; De-differentiation: treatment used to reprogram differentiated cells back to less determined cell states; Perturbation: treatment applied to the sample in order to study the effect of its application; Selection: treatment used to affect biosample in a way that can be used to distinguish cells and select for in the downstream steps; Stimulation: treatment applied to stimulate a cellular pathway.",
      },
      post_treatment_time: {
        title: "Post-treatment Time",
        description:
          "Post treatment time in conjunction with post treatment time units is used to specify the time that has passed between the point when biosamples were removed from the treatment solution before being sampled or treated with the next treatment.",
        type: "number",
        comment:
          "post_treatment_time should be used in conjunction with post_treatment_time_units.",
      },
      post_treatment_time_units: {
        title: "Post-treatment Time Units",
        type: "string",
        enum: ["minute", "hour", "day", "week", "month"],
        comment:
          "post_treatment_time_units should be used in conjunction with post_treatment_time.",
      },
      temperature: {
        title: "Temperature",
        type: "number",
        description:
          "The temperature in Celsius to which the sample was exposed",
        comment:
          "Temperature should be used in conjunction with temperature_units.",
      },
      temperature_units: {
        title: "Temperature Units",
        type: "string",
        enum: ["Celsius"],
        comment:
          "Temperature units should be used in conjunction with temperature.",
      },
      treatment_type: {
        title: "Treatment Type",
        type: "string",
        enum: ["chemical", "protein"],
        description:
          "The classification of treatment agent that specifies its exact molecular nature. Chemical type refers to (natural or synthetic) organic/inorganic compounds and also includes drugs, while protein type is restricted to active protein biomolecules that are naturally or artifically synthesized via cellular translation mechanism of converting DNA into a protein. Example of chemical type: lactate, ethanol,hydrocortisone, LPS etc. Example of protein type: Interferons, interlukin, antibodies, etc.",
        comment:
          "treatment_term_id must be provided for both types. For chemical types, CHEBI ids are required while Uniprot ids are used for protein type.",
      },
      treatment_term_id: {
        "@type": "@id",
        title: "Treatment Term ID",
        description:
          "Ontology identifier describing a component in the treatment.",
        type: "string",
        pattern:
          "^((CHEBI:[0-9]{1,7})|(UniProtKB:[A-Z0-9]{6})|(NTR:[0-9]{2,8}))$",
      },
      treatment_term_name: {
        title: "Treatment Term Name",
        description:
          "Ontology term describing a component in the treatment that is the principal component affecting the biosample being treated. Examples: interferon gamma, interleukin-4, Fibroblast growth factor 2, 20-hydroxyecdysone, 5-bromouridine etc.",
        type: "string",
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
      title: {
        title: "Title",
        type: "string",
        notSubmittable: true,
      },
    },
    boost_values: {
      "@type": 1,
      treatment_term_name: 1,
      treatment_type: 1,
    },
    changelog: "/profiles/changelogs/treatment.md",
    "@type": ["JSONSchema"],
  },

  PhenotypicFeature: {
    title: "Phenotypic Feature",
    description: "Schema for submitting a phenotypic feature.",
    $id: "/profiles/phenotypic_feature.json",
    $schema: "https://json-schema.org/draft/2020-12/schema",
    type: "object",
    required: ["award", "lab", "feature"],
    identifyingProperties: ["uuid", "aliases"],
    additionalProperties: false,
    mixinProperties: [
      {
        $ref: "mixins.json#/basic_item",
      },
      {
        $ref: "mixins.json#/attribution",
      },
      {
        $ref: "mixins.json#/standard_status",
      },
    ],
    dependentRequired: {
      quantity: ["quantity_units"],
      quantity_units: ["quantity"],
    },
    properties: {
      status: {
        title: "Status",
        type: "string",
        default: "in progress",
        permission: "import_items",
        enum: ["deleted", "in progress", "released"],
        readonly: true,
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
      schema_version: {
        title: "Schema Version",
        description:
          "The version of the JSON schema that the server uses to validate the object.",
        comment:
          "Do not submit. The version used to validate the object is set by the server. The default should be set to the current version.",
        type: "string",
        pattern: "^\\d+(\\.\\d+)*$",
        requestMethod: [],
        default: "1",
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
      feature: {
        title: "Phenotypic Feature",
        description: "The phenotypic feature observed for the donor.",
        type: "string",
        linkTo: "PhenotypeTerm",
      },
      quantity: {
        title: "Quantity",
        description:
          "A quantity associated with the phenotypic feature, if applicable.",
        type: "number",
      },
      quantity_units: {
        title: "Quantity Units",
        description:
          "The unit of measurement for a quantity associated with the phenotypic feature.",
        type: "string",
        enum: [
          "meter",
          "micromole",
          "nanogram",
          "microgram",
          "milligram",
          "gram",
          "kilogram",
          "milli-International Unit per milliliter",
          "picogram per milliliter",
          "nanogram per milliliter",
          "milligram per deciliter",
        ],
      },
      observation_date: {
        title: "Observation Date",
        description: "The date the feature was observed or measured.",
        comment: "Date should be submitted as YYYY-MM-DD.",
        type: "string",
        format: "date",
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
    },
    fuzzy_searchable_fields: ["@type", "feature.term_name"],
    changelog: "/profiles/changelogs/phenotypic_feature.md",
    "@type": ["JSONSchema"],
  },

  PredictionSet: {
    title: "Prediction Set",
    description:
      "A file set of computational predictions. Prediction sets contain results of analyses to predict functions or traits of genomic features.",
    $id: "/profiles/prediction_set.json",

    identifyingProperties: [
      "uuid",
      "accession",
      "alternate_accessions",
      "aliases",
    ],

    properties: {
      publication_identifiers: {
        title: "Publication Identifiers",
        description:
          "The publication identifiers that provide more information about the object.",
        type: "array",
        minItems: 1,
        uniqueItems: true,
        items: {
          title: "Publication Identifier",
          description:
            "A publication identifier that provides more information about the object.",
          type: "string",
          pattern:
            "^(PMID:[0-9]+|doi:10\\.[0-9]{4}[\\d\\s\\S:\\.\\/]+|PMCID:PMC[0-9]+|[0-9]{4}\\.[0-9]{4})$",
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
      dbxrefs: {
        "@type": "@id",
        "rdfs:subPropertyOf": "rdfs:seeAlso",
        title: "External Resources",
        description:
          "Identifiers from external resources that may have 1-to-1 or 1-to-many relationships with IGVF file sets.",
        comment:
          "This property is overwritten by the subclasses to define specific enum values.",
        type: "array",
        uniqueItems: true,
        minItems: 1,
        items: {
          title: "External identifier",
          description:
            "Identifier from an external resource that may have 1-to-1 or 1-to-many relationships with IGVF file sets.",
          type: "string",
          pattern: "^GEO:GSE\\d+$",
        },
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
      file_set_type: {
        title: "File Set Type",
        description: "The category that best describes this prediction set.",
        type: "string",
        enum: [
          "pathogenicity",
          "functional effect",
          "protein stability",
          "activity level",
        ],
      },
      scope: {
        title: "Prediction Scope",
        description:
          "The scope or scale that this prediction set is designed to target. If the scope is across gene(s) or loci, these will need to be specified in the targeted_genes or targeted_loci property.",
        type: "string",
        enum: ["genes", "loci", "genome-wide"],
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
    },
  },
  
  AnalysisStep: {
    title: "Analysis Step",
    description: "A step in a computational analysis workflow. For example, a sequence alignment step that represents the phase of the computational analysis in which sequenced reads are being aligned to the reference genome.",
    $id: "/profiles/analysis_step.json",
    identifyingProperties: [
        "uuid",
        "aliases",
        "name"
    ],
    properties: {
        status: {
            title: "Status",
            type: "string",
            default: "in progress",
            permission: "import_items",
            enum: [
                "deleted",
                "in progress",
                "released"
            ]
        },
        lab: {
            title: "Lab",
            description: "Lab associated with the submission.",
            comment: "Required. See lab.json for list of available identifiers.",
            type: "string",
            linkTo: "Lab",
            linkSubmitsFor: true
        },
        award: {
            title: "Award",
            description: "Grant associated with the submission.",
            comment: "Required. See award.json for list of available identifiers.",
            type: "string",
            linkTo: "Award"
        },
        aliases: {
            title: "Aliases",
            description: "Lab specific identifiers to reference an object.",
            comment: "The purpose of this field is to provide a link into the lab LIMS and to facilitate shared objects.",
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: {
                uniqueKey: "alias",
                title: "Lab Alias",
                description: "A lab specific identifier to reference an object.",
                comment: "Current convention is colon separated lab name and lab identifier. (e.g. john-doe:42).",
                type: "string",
                pattern": "^(?:j-michael-cherry|ali-mortazavi|barbara-wold|lior-pachter|grant-macgregor|kim-green|mark-craven|qiongshi-lu|audrey-gasch|robert-steiner|jesse-engreitz|thomas-quertermous|anshul-kundaje|michael-bassik|will-greenleaf|marlene-rabinovitch|lars-steinmetz|jay-shendure|nadav-ahituv|martin-kircher|danwei-huangfu|michael-beer|anna-katerina-hadjantonakis|christina-leslie|alexander-rudensky|laura-donlin|hannah-carter|bing-ren|kyle-gaulton|maike-sander|charles-gersbach|gregory-crawford|tim-reddy|ansuman-satpathy|andrew-allen|gary-hon|nikhil-munshi|w-lee-kraus|lea-starita|doug-fowler|luca-pinello|guillaume-lettre|benhur-lee|daniel-bauer|richard-sherwood|benjamin-kleinstiver|marc-vidal|david-hill|frederick-roth|mikko-taipale|anne-carpenter|hyejung-won|karen-mohlke|michael-love|jason-buenrostro|bradley-bernstein|hilary-finucane|chongyuan-luo|noah-zaitlen|kathrin-plath|roy-wollman|jason-ernst|zhiping-weng|manuel-garber|xihong-lin|alan-boyle|ryan-mills|jie-liu|maureen-sartor|joshua-welch|stephen-montgomery|alexis-battle|livnat-jerby|jonathan-pritchard|predrag-radivojac|sean-mooney|harinder-singh|nidhi-sahni|jishnu-das|hao-wu|sreeram-kannan|hongjun-song|alkes-price|soumya-raychaudhuri|shamil-sunyaev|len-pennacchio|axel-visel|jill-moore|ting-wang|feng-yue|igvf|igvf-dacc):[a-zA-Z\\d_$.+!*,()'-]+(?:\\s[a-zA-Z\\d_$.+!*,()'-]+)*$"
            }
        },
        submitter_comment: {
            title: "Submitter Comment",
            description: "Additional information specified by the submitter to be displayed as a comment on the portal.",
            type: "string",
            pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$",
            formInput: "textarea"
        },
        description: {
            title: "Description",
            description: "A plain text description of the object.",
            type: "string",
            pattern: "^(\\S+(\\s|\\S)*\\S+|\\S)$|^$",
            formInput: "textarea",
        },
        analysis_step_types: {
            title: "Analysis Step Types",
            description: "The classification of the software.",
            type: "array",
            uniqueItems: true,
            items: {
                title: "Type",
                type: "string",
                enum: [
                    "alignment",
                    "file format conversion",
                    "signal generation"
                ]
            },
        },
        step_label: {
            title: "Step Label",
            description: "Unique lowercased label of the analysis step that includes the relevant assays, the software used, and the purpose of the step, e.g. rampage-grit-peak-calling-step",
            comment: "Unique for each analysis_step in a given workflow.",
            type: "string",
            pattern: "^[a-z0-9-]+-step$",
        },
        title: {
            title: "Title",
            description: "The preferred viewable name of the analysis step, likely the same as the step label.",
            type: "string",
            pattern: "^[a-zA-Z\\d_().,-]+(?:\\s[a-zA-Z\\d_().,-]+)*[step|Step]$",
        },
        workflow: {
            title: "Workflow",
            description: "The computational workflow in which this analysis step belongs.",
            type: "string",
            linkTo: "Workflow",
        },
        parents: {
            title: "Parents",
            description: "The precursor steps.",
            uniqueItems: true,
            type: "array",
            items: {
                title: "Parent",
                description: "A precursor step.",
                comment: "See analysis_step.json for available identifiers.",
                type: "string",
                linkTo: "AnalysisStep"
            },
        },
        input_content_types: {
            title: "Input Content Types",
            description: "The content types used as input for the analysis step.",
            type: "array",
            uniqueItems: true,
            items: {
                title: "Input Content Type",
                description: "A content type used as input for the analysis step.",
                type: "string",
                anyOf: [
                    {
                        comment: "Content Type describes the content of the file.",
                        enum: [
                            "alignments",
                            "transcriptome alignments"
                        ]
                    },
                    {
                        comment: "Content Type describes the content of the file.",
                        enum: [
                            "seqspec"
                        ],
                    },
                    {
                        comment: "Content Type describes the content of the file.",
                        enum: [
                            "contact matrix",
                            "sparse gene count matrix",
                            "sparse peak count matrix",
                            "sparse transcript count matrix",
                            "transcriptome annotations"
                        ]
                    },
                    {
                        comment: "Content Type describes the content of the file. Genome reference are composite nucleic acid sequences assembled from the sequence of several different individual organisms representing the species. Guide RNA sequences are sequences of RNA molecules used in assays involving CRISPR editing. Sequence barcodes are lists of barcodes found in the sequencing library. Spike-ins are nucleic acid fragments of known sequence and quantity used for calibration in high-throughput sequencing. Transcriptome references are transcriptomic sequences of an idealized representative individual in a species. Vector sequences are sequences tested in MPRAs.",
                        enum: [
                            "biological_context",
                            "complexes",
                            "complexes_complexes",
                            "complexes_proteins",
                            "complexes_terms",
                            "diseases_genes",
                            "drugs",
                            "elements_genes",
                            "exclusion list",
                            "genes",
                            "genes_genes",
                            "genes_pathways",
                            "genes_terms",
                            "genes_transcripts",
                            "genome reference",
                            "go_terms_proteins",
                            "guide RNA sequences",
                            "inclusion list",
                            "motifs",
                            "motifs_proteins",
                            "ontology_terms",
                            "ontology_terms_ontology_terms",
                            "pathways",
                            "pathways_pathways",
                            "proteins",
                            "regulatory_regions",
                            "sequence barcodes",
                            "spike-ins",
                            "studies",
                            "studies_variants",
                            "studies_variants_phenotypes",
                            "transcriptome reference",
                            "transcripts",
                            "transcripts_proteins",
                            "variants",
                            "variants_drugs",
                            "variants_drugs_genes",
                            "variants_genes",
                            "variants_proteins",
                            "variants_proteins_terms",
                            "variants_regulatory_regions",
                            "variants_variants",
                            "vector sequences"
                        ]
                    },
                    {
                        comment: "Content Type describes the content of the file. Reads are individual sequences of bases corresponding to DNA or RNA fragments in a FASTQ text file format. Subreads are sequences of bases produced using PacBio platforms.",
                        enum: [
                            "reads",
                            "subreads"
                        ]
                    },
                    {
                        comment: "Content Type describes the content of the file.",
                        enum: [
                            "signal",
                            "signal of all reads",
                            "signal of unique reads",
                            "signal p-value",
                            "raw signal",
                            "read-depth signal",
                            "control signal",
                            "fold over change control"
                        ]
                    }
                ]
            }
        },
        output_content_types: {
            title: "Output Content Types",
            description: "The content types produced as output by the analysis step.",
            type: "array",
            uniqueItems: true,
            items: {
                title: "Output Content Type",
                description: "A content type produced as output by the analysis step.",
                type: "string",
                anyOf: [
                    {
                        comment: "Content Type describes the content of the file.",
                        enum: [
                            "alignments",
                            "transcriptome alignments"
                        ],
                    },
                    {
                        comment: "Content Type describes the content of the file.",
                        enum: [
                            "seqspec"
                        ]
                    },
                    {
                        comment: "Content Type describes the content of the file.",
                        enum: [
                            "contact matrix",
                            "sparse gene count matrix",
                            "sparse peak count matrix",
                            "sparse transcript count matrix",
                            "transcriptome annotations"
                        ],
                    },
                    {
                        comment: "Content Type describes the content of the file. Genome reference are composite nucleic acid sequences assembled from the sequence of several different individual organisms representing the species. Guide RNA sequences are sequences of RNA molecules used in assays involving CRISPR editing. Sequence barcodes are lists of barcodes found in the sequencing library. Spike-ins are nucleic acid fragments of known sequence and quantity used for calibration in high-throughput sequencing. Transcriptome references are transcriptomic sequences of an idealized representative individual in a species. Vector sequences are sequences tested in MPRAs.",
                        enum: [
                            "biological_context",
                            "complexes",
                            "complexes_complexes",
                            "complexes_proteins",
                            "complexes_terms",
                            "diseases_genes",
                            "drugs",
                            "elements_genes",
                            "exclusion list",
                            "genes",
                            "genes_genes",
                            "genes_pathways",
                            "genes_terms",
                            "genes_transcripts",
                            "genome reference",
                            "go_terms_proteins",
                            "guide RNA sequences",
                            "inclusion list",
                            "motifs",
                            "motifs_proteins",
                            "ontology_terms",
                            "ontology_terms_ontology_terms",
                            "pathways",
                            "pathways_pathways",
                            "proteins",
                            "regulatory_regions",
                            "sequence barcodes",
                            "spike-ins",
                            "studies",
                            "studies_variants",
                            "studies_variants_phenotypes",
                            "transcriptome reference",
                            "transcripts",
                            "transcripts_proteins",
                            "variants",
                            "variants_drugs",
                            "variants_drugs_genes",
                            "variants_genes",
                            "variants_proteins",
                            "variants_proteins_terms",
                            "variants_regulatory_regions",
                            "variants_variants",
                            "vector sequences"
                        ],
                    },
                    {
                        comment: "Content Type describes the content of the file. Reads are individual sequences of bases corresponding to DNA or RNA fragments in a FASTQ text file format. Subreads are sequences of bases produced using PacBio platforms.",
                        enum: [
                            "reads",
                            "subreads"
                        ],
                    },
                    {
                        comment: "Content Type describes the content of the file.",
                        enum: [
                            "signal",
                            "signal of all reads",
                            "signal of unique reads",
                            "signal p-value",
                            "raw signal",
                            "read-depth signal",
                            "control signal",
                            "fold over change control"
                        ],
                    }
                ]
            },
        },
        "@id": {
            title: "ID",
            type: "string",
            notSubmittable: true
        },
        "@type": {
            title: "Type",
            type: "array",
            items: {
                "type": "string"
            },
            notSubmittable: true
        },
        summary: {
            title: "Summary",
            type: "string",
            notSubmittable: true
        },
        name: {
            title: "Name",
            type: "string",
            description: "Full name of the analysis step.",
            comment: "Do not submit. Value is automatically assigned by the server.",
            uniqueKey: "name",
            notSubmittable: true
        }
    },
};

export default profiles;

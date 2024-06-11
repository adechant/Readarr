using System.Collections.Generic;
using System.Linq;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.ThingiProvider;
using NzbDrone.Core.Validation;
using NzbDrone.Http.REST.Attributes;
using Readarr.Http.REST;

namespace Readarr.Api.V1
{
    public abstract class ProviderControllerBase<TProviderResource, TBulkProviderResource, TProvider, TProviderDefinition> : RestController<TProviderResource>
        where TProviderDefinition : ProviderDefinition, new()
        where TProvider : IProvider
        where TProviderResource : ProviderResource<TProviderResource>, new()
        where TBulkProviderResource : ProviderBulkResource<TBulkProviderResource>, new()
    {
        private readonly IProviderFactory<TProvider, TProviderDefinition> _providerFactory;
        private readonly ProviderResourceMapper<TProviderResource, TProviderDefinition> _resourceMapper;
        private readonly ProviderBulkResourceMapper<TBulkProviderResource, TProviderDefinition> _bulkResourceMapper;

        protected ProviderControllerBase(IProviderFactory<TProvider,
            TProviderDefinition> providerFactory,
            string resource,
            ProviderResourceMapper<TProviderResource, TProviderDefinition> resourceMapper,
            ProviderBulkResourceMapper<TBulkProviderResource, TProviderDefinition> bulkResourceMapper)
        {
            _providerFactory = providerFactory;
            _resourceMapper = resourceMapper;
            _bulkResourceMapper = bulkResourceMapper;

            SharedValidator.RuleFor(c => c.Name).NotEmpty();
            SharedValidator.RuleFor(c => c.Name).Must((v, c) => !_providerFactory.All().Any(p => p.Name.EqualsIgnoreCase(c) && p.Id != v.Id)).WithMessage("Should be unique");
            SharedValidator.RuleFor(c => c.Implementation).NotEmpty();
            SharedValidator.RuleFor(c => c.ConfigContract).NotEmpty();

            PostValidator.RuleFor(c => c.Fields).NotNull();
        }

        protected override TProviderResource GetResourceById(int id)
        {
            var definition = _providerFactory.Get(id);
            _providerFactory.SetProviderCharacteristics(definition);

            return _resourceMapper.ToResource(definition);
        }

        [HttpGet]
        [Produces("application/json")]
        public List<TProviderResource> GetAll()
        {
            var providerDefinitions = _providerFactory.All().OrderBy(p => p.ImplementationName);

            var result = new List<TProviderResource>(providerDefinitions.Count());

            foreach (var definition in providerDefinitions)
            {
                _providerFactory.SetProviderCharacteristics(definition);

                result.Add(_resourceMapper.ToResource(definition));
            }

            return result.OrderBy(p => p.Name).ToList();
        }

        [RestPostById]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<TProviderResource> CreateProvider([FromBody] TProviderResource providerResource, [FromQuery] bool forceSave = false)
        {
            var providerDefinition = GetDefinition(providerResource, true, !forceSave, false);

            if (providerDefinition.Enable)
            {
                Test(providerDefinition, !forceSave);
            }

            providerDefinition = _providerFactory.Create(providerDefinition);

            return Created(providerDefinition.Id);
        }

        [RestPutById]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<TProviderResource> UpdateProvider([FromBody] TProviderResource providerResource, [FromQuery] bool forceSave = false)
        {
            var providerDefinition = GetDefinition(providerResource, true, !forceSave, false);

            // Only test existing definitions if it is enabled and forceSave isn't set.
            if (providerDefinition.Enable && !forceSave)
            {
                Test(providerDefinition, true);
            }

            _providerFactory.Update(providerDefinition);

            return Accepted(providerResource.Id);
        }

        [HttpPut("bulk")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public virtual ActionResult<TProviderResource> UpdateProvider([FromBody] TBulkProviderResource providerResource)
        {
            if (!providerResource.Ids.Any())
            {
                throw new BadRequestException("ids must be provided");
            }

            var definitionsToUpdate = _providerFactory.Get(providerResource.Ids).ToList();

            foreach (var definition in definitionsToUpdate)
            {
                _providerFactory.SetProviderCharacteristics(definition);

                if (providerResource.Tags != null)
                {
                    var newTags = providerResource.Tags;
                    var applyTags = providerResource.ApplyTags;

                    switch (applyTags)
                    {
                        case ApplyTags.Add:
                            newTags.ForEach(t => definition.Tags.Add(t));
                            break;
                        case ApplyTags.Remove:
                            newTags.ForEach(t => definition.Tags.Remove(t));
                            break;
                        case ApplyTags.Replace:
                            definition.Tags = new HashSet<int>(newTags);
                            break;
                    }
                }
            }

            _bulkResourceMapper.UpdateModel(providerResource, definitionsToUpdate);

            return Accepted(_providerFactory.Update(definitionsToUpdate).Select(x => _resourceMapper.ToResource(x)));
        }

        private TProviderDefinition GetDefinition(TProviderResource providerResource, bool validate, bool includeWarnings, bool forceValidate)
        {
            var definition = _resourceMapper.ToModel(providerResource);

            if (validate && (definition.Enable || forceValidate))
            {
                Validate(definition, includeWarnings);
            }

            return definition;
        }

        [RestDeleteById]
        public object DeleteProvider(int id)
        {
            _providerFactory.Delete(id);

            return new { };
        }

        [HttpDelete("bulk")]
        [Consumes("application/json")]
        public virtual object DeleteProviders([FromBody] TBulkProviderResource resource)
        {
            _providerFactory.Delete(resource.Ids);

            return new { };
        }

        [HttpGet("schema")]
        [Produces("application/json")]
        public List<TProviderResource> GetTemplates()
        {
            var defaultDefinitions = _providerFactory.GetDefaultDefinitions().OrderBy(p => p.ImplementationName).ToList();

            var result = new List<TProviderResource>(defaultDefinitions.Count);

            foreach (var providerDefinition in defaultDefinitions)
            {
                var providerResource = _resourceMapper.ToResource(providerDefinition);
                var presetDefinitions = _providerFactory.GetPresetDefinitions(providerDefinition);

                providerResource.Presets = presetDefinitions
                    .Select(v => _resourceMapper.ToResource(v))
                    .ToList();

                result.Add(providerResource);
            }

            return result;
        }

        [SkipValidation(true, false)]
        [HttpPost("test")]
        [Consumes("application/json")]
        public object Test([FromBody] TProviderResource providerResource, [FromQuery] bool forceTest = false)
        {
            var providerDefinition = GetDefinition(providerResource, true, !forceTest, true);

            Test(providerDefinition, true);

            return "{}";
        }

        [HttpPost("testall")]
        [Produces("application/json")]
        public IActionResult TestAll()
        {
            var providerDefinitions = _providerFactory.All()
                .Where(c => c.Settings.Validate().IsValid && c.Enable)
                .ToList();
            var result = new List<ProviderTestAllResult>();

            foreach (var definition in providerDefinitions)
            {
                var validationResult = _providerFactory.Test(definition);

                result.Add(new ProviderTestAllResult
                {
                    Id = definition.Id,
                    ValidationFailures = validationResult.Errors.ToList()
                });
            }

            return result.Any(c => !c.IsValid) ? BadRequest(result) : Ok(result);
        }

        [SkipValidation]
        [HttpPost("action/{name}")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public IActionResult RequestAction(string name, [FromBody] TProviderResource resource)
        {
            var providerDefinition = GetDefinition(resource, false, false, false);

            var query = Request.Query.ToDictionary(x => x.Key, x => x.Value.ToString());

            var data = _providerFactory.RequestAction(providerDefinition, name, query);

            return Content(data.ToJson(), "application/json");
        }

        private void Validate(TProviderDefinition definition, bool includeWarnings)
        {
            var validationResult = definition.Settings.Validate();

            VerifyValidationResult(validationResult, includeWarnings);
        }

        protected virtual void Test(TProviderDefinition definition, bool includeWarnings)
        {
            var validationResult = _providerFactory.Test(definition);

            VerifyValidationResult(validationResult, includeWarnings);
        }

        protected void VerifyValidationResult(ValidationResult validationResult, bool includeWarnings)
        {
            var result = validationResult as NzbDroneValidationResult ?? new NzbDroneValidationResult(validationResult.Errors);

            if (includeWarnings && (!result.IsValid || result.HasWarnings))
            {
                throw new ValidationException(result.Failures);
            }

            if (!result.IsValid)
            {
                throw new ValidationException(result.Errors);
            }
        }
    }
}
